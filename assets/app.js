/* ============================================================
   3-Week Fat-Loss Plan — shared client script (vanilla, no deps)
   Everything hangs off window.FP.
   ============================================================ */
(function () {
  "use strict";
  const FP = (window.FP = window.FP || {});

  /* ==========================================================
     PERSISTENCE LAYER  (built to swap localStorage -> DB/API)
     ----------------------------------------------------------
     All app code talks to `FP.Storage` (a Store instance) using
     an async Promise API. To move to a backend later, write one
     new adapter with the same 4 methods and change the single
     `createStorage()` line at the bottom of this block. No call
     sites change.
     ========================================================== */

  // --- Adapter interface (contract) -------------------------
  //   get(key)      -> Promise<any | null>
  //   set(key,val)  -> Promise<void>
  //   remove(key)   -> Promise<void>
  //   keys(prefix)  -> Promise<string[]>

  function LocalStorageAdapter() {
    const ok = (() => {
      try { const t = "__fp__"; localStorage.setItem(t, "1"); localStorage.removeItem(t); return true; }
      catch (e) { return false; }
    })();
    const mem = {}; // fallback when localStorage is unavailable (private mode / file:// quirks)
    return {
      name: ok ? "localStorage" : "memory",
      async get(key) {
        try { const v = ok ? localStorage.getItem(key) : (key in mem ? mem[key] : null);
          return v == null ? null : JSON.parse(v); } catch (e) { return null; }
      },
      async set(key, val) {
        const s = JSON.stringify(val);
        if (ok) localStorage.setItem(key, s); else mem[key] = s;
      },
      async remove(key) { if (ok) localStorage.removeItem(key); else delete mem[key]; },
      async keys(prefix) {
        const src = ok ? Object.keys(localStorage) : Object.keys(mem);
        return src.filter((k) => k.indexOf(prefix) === 0);
      },
    };
  }

  /* Example future adapter (left as a template, intentionally unused):

     function ApiAdapter(baseUrl, token) {
       const h = { "Content-Type": "application/json", Authorization: "Bearer " + token };
       return {
         name: "api",
         async get(key)      { const r = await fetch(`${baseUrl}/kv/${encodeURIComponent(key)}`, { headers: h });
                               return r.status === 404 ? null : (await r.json()).value; },
         async set(key, val) { await fetch(`${baseUrl}/kv/${encodeURIComponent(key)}`,
                               { method: "PUT", headers: h, body: JSON.stringify({ value: val }) }); },
         async remove(key)   { await fetch(`${baseUrl}/kv/${encodeURIComponent(key)}`, { method: "DELETE", headers: h }); },
         async keys(prefix)  { const r = await fetch(`${baseUrl}/kv?prefix=${encodeURIComponent(prefix)}`, { headers: h });
                               return (await r.json()).keys; },
       };
     }
     // To migrate: FP.Storage = createStorage(ApiAdapter("/api", userToken));
  */

  // --- Namespaced store facade ------------------------------
  function Store(adapter, namespace) {
    this.adapter = adapter;
    this.ns = namespace + ":";
  }
  Store.prototype._k = function (key) { return this.ns + key; };
  Store.prototype.get = function (key, fallback) {
    return this.adapter.get(this._k(key)).then((v) => (v == null ? (fallback === undefined ? null : fallback) : v));
  };
  Store.prototype.set = function (key, val) { return this.adapter.set(this._k(key), val); };
  Store.prototype.remove = function (key) { return this.adapter.remove(this._k(key)); };
  // Dump everything in this namespace — handy for backups AND for a future DB migration.
  Store.prototype.exportAll = async function () {
    const keys = await this.adapter.keys(this.ns);
    const out = {};
    for (const k of keys) out[k.slice(this.ns.length)] = await this.adapter.get(k);
    return out;
  };
  Store.prototype.importAll = async function (obj) {
    for (const k of Object.keys(obj || {})) await this.set(k, obj[k]);
  };
  Store.prototype.clearAll = async function () {
    const keys = await this.adapter.keys(this.ns);
    for (const k of keys) await this.adapter.remove(k);
  };

  function createStorage(adapter) { return new Store(adapter, "foodplan"); }

  // The single wiring point. Swap the adapter here to change backends.
  FP.Storage = createStorage(LocalStorageAdapter());
  FP.adapters = { LocalStorageAdapter }; // exposed for tests / future swaps

  /* ==========================================================
     GENERIC UI BEHAVIORS (data-attribute driven)
     ========================================================== */

  // Highlight the current page in the top nav.
  function markActiveNav() {
    const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".nav-links a").forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === here || (here === "" && href === "index.html")) a.classList.add("active");
    });
  }

  // Mobile nav toggle.
  function bindNavToggle() {
    const btn = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (btn && links) btn.addEventListener("click", () => links.classList.toggle("show"));
  }

  // Accordions: <button class="acc-head" aria-expanded="false">…</button><div class="acc-body">
  function bindAccordions() {
    document.querySelectorAll(".acc-head").forEach((head) => {
      head.setAttribute("aria-expanded", head.getAttribute("aria-expanded") || "false");
      head.addEventListener("click", () => {
        const open = head.getAttribute("aria-expanded") === "true";
        head.setAttribute("aria-expanded", String(!open));
        const body = head.nextElementSibling;
        if (body && body.classList.contains("acc-body")) body.classList.toggle("open", !open);
      });
    });
  }

  // Tab groups: container[data-tabs] with .tab[data-target] buttons and [data-panel] panels.
  function bindTabs() {
    document.querySelectorAll("[data-tabs]").forEach((group) => {
      const tabs = group.querySelectorAll(".tab");
      const panels = group.querySelectorAll("[data-panel]");
      tabs.forEach((tab) => tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.getAttribute("data-target");
        panels.forEach((p) => (p.style.display = p.getAttribute("data-panel") === target ? "" : "none"));
      }));
      if (tabs[0]) tabs[0].click();
    });
  }

  /* ==========================================================
     REUSABLE PERSISTENCE HELPERS (used by tracker + shopping)
     ========================================================== */

  // Bind a set of checkboxes (each with data-item="...") to one stored record.
  // Returns a small controller so pages can react (e.g. update a progress bar).
  FP.bindChecklist = async function (container, recordKey, onChange) {
    if (!container) return;
    const boxes = container.querySelectorAll('input[type="checkbox"][data-item]');
    const saved = (await FP.Storage.get(recordKey, {})) || {};
    boxes.forEach((b) => { if (saved[b.dataset.item]) b.checked = true; });
    const fire = () => { if (onChange) onChange(countChecked(boxes), boxes.length); };
    container.addEventListener("change", async (e) => {
      const t = e.target;
      if (t.matches('input[type="checkbox"][data-item]')) {
        const cur = (await FP.Storage.get(recordKey, {})) || {};
        cur[t.dataset.item] = t.checked;
        await FP.Storage.set(recordKey, cur);
        fire();
      }
    });
    fire();
    return { refresh: fire };
  };

  function countChecked(boxes) { let n = 0; boxes.forEach((b) => b.checked && n++); return n; }

  /* ==========================================================
     INIT
     ========================================================== */
  function init() {
    markActiveNav();
    bindNavToggle();
    bindAccordions();
    bindTabs();
    // Stamp current year wherever requested.
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
