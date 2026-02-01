/*!
 * Urgency Timer Storefront Script
 * Grid-based countdown renderer (no separators)
 * Safe for Shopify App Proxy + Extensions
 */

(() => {
  const DEBUG = true;

  const STATE = {
    fetched: false,
    timers: [],
    fetchPromise: null,
  };

  // change to "/apps/urgency-timer/timers" in production
  const DEFAULT_ENDPOINT =
    "https://reid-moses-donors-xbox.trycloudflare.com/public/timers";

  function log(...args) {
    if (DEBUG) console.log("[UrgencyTimer]", ...args);
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function getEndpoint() {
    return window.URGENCY_TIMER_ENDPOINT || DEFAULT_ENDPOINT;
  }

  function getCountry() {
    try {
      if (window.Shopify?.country) return String(window.Shopify.country).toUpperCase();
      const meta = document.querySelector('meta[name="shopify-country-code"]');
      if (meta?.content) return meta.content.toUpperCase();
    } catch {}
    return "";
  }

  function detectPageType(root) {
    const url = location.href.toLowerCase();
    if (root?.dataset?.productId) return "product";
    if (url.includes("/cart")) return "cart";
    if (url === location.origin + "/" || url.endsWith("/home")) return "home";
    return "page";
  }

  function detectContext() {
    const root = document.querySelector(".urgency-timer-root");
    return {
      shop:
        root?.dataset?.shopDomain ||
        window.Shopify?.shop ||
        "",
      productId: root?.dataset?.productId || "",
      timerId: root?.dataset?.timerId || "",
      pageType: detectPageType(root),
      pageUrl: location.href,
      country: getCountry(),
      collectionIds: extractCollectionIds(),
      productTags: extractProductTags(),
    };
  }

  function extractCollectionIds() {
    try {
      const og = document.querySelector('meta[property="og:url"]')?.content;
      const m = og?.match(/\/collections\/([^\/\?]+)/);
      if (m) return [m[1]];
    } catch {}
    return [];
  }

  function extractProductTags() {
    try {
      const tags = window.ShopifyAnalytics?.meta?.product?.tags;
      if (Array.isArray(tags)) return tags.map(t => String(t).toLowerCase());
    } catch {}
    return [];
  }

  function buildQuery(ctx) {
    const p = new URLSearchParams();
    Object.entries(ctx).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length) p.set(k, v.join(","));
      else if (v) p.set(k, v);
    });
    return p.toString();
  }

  function fetchTimersOnce(ctx) {
    if (STATE.fetchPromise) return STATE.fetchPromise;

    const url = `${getEndpoint()}?${buildQuery(ctx)}`;
    log("Fetching timers:", url);

    STATE.fetchPromise = fetch(url)
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(d => (STATE.timers = d?.timers || []))
      .catch(e => {
        log("Fetch error", e);
        STATE.timers = [];
      });

    return STATE.fetchPromise;
  }

  /* ================= Countdown Logic ================= */

  function msUntil(date) {
    return new Date(date).getTime() - Date.now();
  }

  function getFixedTimerRemainingSeconds(timer) {
    const key = `utimer_fixed_${timer.id}_start`;
    const ttl = (timer.fixedMinutes || 0) * 60;
    const now = Math.floor(Date.now() / 1000);
    const started = Number(localStorage.getItem(key) || now);
    localStorage.setItem(key, started);
    return Math.max(0, ttl - (now - started));
  }

  function formatDHMS(sec) {
    sec = Math.max(0, sec);
    return {
      days: Math.floor(sec / 86400),
      hours: Math.floor((sec % 86400) / 3600),
      minutes: Math.floor((sec % 3600) / 60),
      seconds: sec % 60,
    };
  }

  const pad = n => (n < 10 ? "0" + n : String(n));

  /* ================= GRID COUNTDOWN DOM ================= */

  function createCountdownDOM(timer) {
    const c = document.createElement("div");
    c.className = "utimer-container";

    const title = el("div", "utimer-title", timer.title);
    const sub = el("div", "utimer-sub", timer.subheading);

    const countdown = document.createElement("div");
    countdown.className = "utimer-countdown";

    const numbersRow = document.createElement("div");
    numbersRow.className = "utimer-numbers-row";

    const labelsRow = document.createElement("div");
    labelsRow.className = "utimer-labels-row";

    const units = ["days", "hours", "minutes", "seconds"];
    const labels = [
      timer.daysLabel || "Days",
      timer.hoursLabel || "Hrs",
      timer.minutesLabel || "Mins",
      timer.secondsLabel || "Secs",
    ];

    const valueEls = {};

    units.forEach((u, i) => {
      const n = el("span", "utimer-number", "00");
      const l = el("span", "utimer-label", labels[i]);
      numbersRow.appendChild(n);

      // Add colon separator after all units except the last one
      if (i < units.length - 1) {
        const sep = el("span", "utimer-separator", ":");
        numbersRow.appendChild(sep);
      }

      labelsRow.appendChild(l);
      valueEls[u] = n;
    });

    countdown.append(numbersRow, labelsRow);

    const dc = timer.designConfig || {};
    if (dc.timerSize) {
      numbersRow.querySelectorAll(".utimer-number").forEach(e => (e.style.fontSize = dc.timerSize + "px"));
      numbersRow.querySelectorAll(".utimer-separator").forEach(e => (e.style.fontSize = dc.timerSize + "px"));
    }
    if (dc.timerColor) {
      numbersRow.querySelectorAll(".utimer-number").forEach(e => (e.style.color = dc.timerColor));
      numbersRow.querySelectorAll(".utimer-separator").forEach(e => (e.style.color = dc.timerColor));
    }
    if (dc.legendSize)
      labelsRow.querySelectorAll(".utimer-label").forEach(e => (e.style.fontSize = dc.legendSize + "px"));
    if (dc.legendColor)
      labelsRow.querySelectorAll(".utimer-label").forEach(e => (e.style.color = dc.legendColor));

    c.append(title);
    if (timer.subheading) c.append(sub);
    c.append(countdown);

    if (timer.ctaType === "button" && timer.buttonLink) {
      const cta = el("div", "utimer-cta");
      const a = el("a", "utimer-button", timer.buttonText || "Shop now!");
      a.href = timer.buttonLink;
      cta.appendChild(a);
      c.append(cta);
    }

    let id = setInterval(update, 1000);
    update();

    function update() {
      let remaining = 0;
      if (timer.timerType === "fixed")
        remaining = getFixedTimerRemainingSeconds(timer);
      else if (timer.endDate)
        remaining = Math.floor(msUntil(timer.endDate) / 1000);

      const t = formatDHMS(remaining);
      units.forEach(u => (valueEls[u].textContent = pad(t[u])));

      if (remaining <= 0) {
        clearInterval(id);
        if ((timer.onExpiry || "hide") !== "keep") c.remove();
      }
    }

    return c;
  }

  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  }

  /* ================= Mounting ================= */

  function mountProductTimers(ctx, timers) {
    document.querySelectorAll(".urgency-timer-root").forEach(root => {
      const t = timers.find(x => x.type === "product-page");
      if (!t) return;
      root.innerHTML = "";
      root.appendChild(createCountdownDOM(t));
    });
  }

  function mountBars(ctx, timers) {
    timers
      .filter(t => t.type === "top-bottom-bar")
      .forEach(t => {
        const bar = document.createElement("div");
        const position = t.designConfig?.positioning === "bottom" ? "bottom" : "top";
        bar.className = "utimer-bar " + position;

        // Force button to show in bar
        const originalCtaType = t.ctaType;
        const originalButtonLink = t.buttonLink;
        if (!t.buttonLink) t.buttonLink = "#";
        t.ctaType = "button";

        bar.appendChild(createCountdownDOM(t));

        // Restore original values
        t.ctaType = originalCtaType;
        t.buttonLink = originalButtonLink;

        document.body.appendChild(bar);

        // Add body padding to prevent overlap
        requestAnimationFrame(() => {
          const barHeight = bar.offsetHeight;
          if (position === "top") {
            document.body.style.paddingTop = barHeight + "px";
          } else {
            document.body.style.paddingBottom = barHeight + "px";
          }
        });
      });
  }

  function init() {
    const ctx = detectContext();
    if (!ctx.shop) return;

    fetchTimersOnce(ctx).then(timers => {
      mountProductTimers(ctx, timers);
      mountBars(ctx, timers);
    });
  }

  ready(init);
})();
