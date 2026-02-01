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

  // App Proxy path: Shopify proxies to your app (works on any merchant store)
  const DEFAULT_ENDPOINT = "/apps/urgency-timer/timers";

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

    c.append(title);
    if (timer.subheading) c.append(sub);
    c.append(countdown);

    const hasExplicitButton = timer.ctaType === "button" && timer.buttonLink;
    const isBarWithButton = timer.type === "top-bottom-bar" && timer.ctaType !== "none";
    let buttonEl = null;
    if (hasExplicitButton || isBarWithButton) {
      const ctaWrap = el("div", "utimer-cta", "");
      const a = el("a", "utimer-button", timer.buttonText || "Shop now!");
      a.href = timer.buttonLink || "/";
      buttonEl = a;
      ctaWrap.appendChild(a);
      c.append(ctaWrap);
    }

    /* ========== Sync designConfig with storefront ========== */
    const isBar = timer.type === "top-bottom-bar";
    if (!isBar) {
      if (dc.backgroundColor != null || (dc.backgroundType === "gradient" && dc.gradientStartColor && dc.gradientEndColor)) {
        if (dc.backgroundType === "gradient" && dc.gradientStartColor && dc.gradientEndColor) {
          c.style.background = "linear-gradient(135deg, " + dc.gradientStartColor + ", " + dc.gradientEndColor + ")";
        } else {
          c.style.backgroundColor = dc.backgroundColor || "";
        }
      }
      if (dc.borderRadius != null) c.style.borderRadius = dc.borderRadius + "px";
      if (dc.borderSize != null && dc.borderSize > 0 && dc.borderColor) {
        c.style.border = dc.borderSize + "px solid " + dc.borderColor;
      }
      if (dc.paddingTop != null) c.style.paddingTop = dc.paddingTop + "px";
      if (dc.paddingBottom != null) c.style.paddingBottom = dc.paddingBottom + "px";
      if (dc.marginTop != null) c.style.marginTop = dc.marginTop + "px";
      if (dc.marginBottom != null) c.style.marginBottom = dc.marginBottom + "px";
    }

    if (dc.titleSize != null) title.style.fontSize = dc.titleSize + "px";
    if (dc.titleColor) title.style.color = dc.titleColor;
    if (dc.titleFontWeight) title.style.fontWeight = dc.titleFontWeight;
    if (dc.titleFontFamily) title.style.fontFamily = dc.titleFontFamily;

    if (dc.subheadingSize != null) sub.style.fontSize = dc.subheadingSize + "px";
    if (dc.subheadingColor) sub.style.color = dc.subheadingColor;
    if (dc.subheadingFontWeight) sub.style.fontWeight = dc.subheadingFontWeight;
    if (dc.subheadingFontFamily) sub.style.fontFamily = dc.subheadingFontFamily;

    if (dc.timerSize != null) {
      numbersRow.querySelectorAll(".utimer-number").forEach(e => (e.style.fontSize = dc.timerSize + "px"));
      numbersRow.querySelectorAll(".utimer-separator").forEach(e => (e.style.fontSize = dc.timerSize + "px"));
    }
    if (dc.timerColor) {
      numbersRow.querySelectorAll(".utimer-number").forEach(e => (e.style.color = dc.timerColor));
      numbersRow.querySelectorAll(".utimer-separator").forEach(e => (e.style.color = dc.timerColor));
    }
    if (dc.timerFontWeight) {
      numbersRow.querySelectorAll(".utimer-number").forEach(e => (e.style.fontWeight = dc.timerFontWeight));
      numbersRow.querySelectorAll(".utimer-separator").forEach(e => (e.style.fontWeight = dc.timerFontWeight));
    }
    if (dc.timerFontFamily) {
      numbersRow.querySelectorAll(".utimer-number").forEach(e => (e.style.fontFamily = dc.timerFontFamily));
      numbersRow.querySelectorAll(".utimer-separator").forEach(e => (e.style.fontFamily = dc.timerFontFamily));
    }

    if (dc.legendSize != null)
      labelsRow.querySelectorAll(".utimer-label").forEach(e => (e.style.fontSize = dc.legendSize + "px"));
    if (dc.legendColor)
      labelsRow.querySelectorAll(".utimer-label").forEach(e => (e.style.color = dc.legendColor));
    if (dc.legendFontWeight)
      labelsRow.querySelectorAll(".utimer-label").forEach(e => (e.style.fontWeight = dc.legendFontWeight));
    if (dc.legendFontFamily)
      labelsRow.querySelectorAll(".utimer-label").forEach(e => (e.style.fontFamily = dc.legendFontFamily));

    if (buttonEl) {
      if (dc.buttonFontSize != null) buttonEl.style.fontSize = dc.buttonFontSize + "px";
      if (dc.buttonCornerRadius != null) buttonEl.style.borderRadius = dc.buttonCornerRadius + "px";
      if (dc.buttonColor) buttonEl.style.color = dc.buttonColor;
      if (dc.buttonBackgroundColor) buttonEl.style.backgroundColor = dc.buttonBackgroundColor;
      if (dc.buttonBorderColor && dc.buttonBorderSize != null && dc.buttonBorderSize > 0) {
        buttonEl.style.border = dc.buttonBorderSize + "px solid " + dc.buttonBorderColor;
      }
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
        const isTop = t.designConfig?.positioning !== "bottom";
        bar.className = "utimer-bar " + (isTop ? "top" : "bottom");

        const dc = t.designConfig || {};
        if (dc.backgroundType === "gradient" && dc.gradientStartColor && dc.gradientEndColor) {
          bar.style.background = "linear-gradient(135deg, " + dc.gradientStartColor + ", " + dc.gradientEndColor + ")";
        } else if (dc.backgroundColor != null) {
          bar.style.backgroundColor = dc.backgroundColor;
        }
        if (dc.paddingTop != null) bar.style.paddingTop = Math.min(dc.paddingTop, 10) + "px";
        if (dc.paddingBottom != null) bar.style.paddingBottom = Math.min(dc.paddingBottom, 10) + "px";

        bar.appendChild(createCountdownDOM(t));
        if (isTop) {
          document.body.insertBefore(bar, document.body.firstChild);
        } else {
          document.body.appendChild(bar);
        }
      });
  }

  function applyMinimalStyles() {
    const id = "utimer-minimal-style";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      .utimer-container {
        padding: 32px 24px;
        border: 0 solid #e5e7eb;
        border-radius: 8px;
        background: #ffffff;
        color: #1f2937;
        max-width: 720px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }

      .utimer-title {
        font-size: 28px;
        font-weight: 700;
        line-height: 1.2;
        margin: 0;
      }

      .utimer-sub {
        font-size: 16px;
        color: #4b5563;
        margin: 0 0 6px 0;
      }

      /* Grid-based countdown */

      .utimer-countdown {
        display: grid;
        grid-template-columns: repeat(4, auto) repeat(3, auto);
        grid-template-rows: auto auto;
        column-gap: 4px;
        row-gap: 6px;
        justify-items: center;
        align-items: start;
        width: fit-content;
        margin-left: auto;
        margin-right: auto;
      }

      .utimer-numbers-row {
        display: contents;
      }

      .utimer-number {
        grid-row: 1;
        font-size: 40px;
        font-weight: 700;
        line-height: 1;
        font-feature-settings: "tnum" 1, "lnum" 1;
        font-variant-numeric: tabular-nums lining-nums;
        text-align: center;
        min-width: 3ch;
      }

      .utimer-separator {
        grid-row: 1;
        font-size: 40px;
        font-weight: 700;
        line-height: 1;
        text-align: center;
        padding: 0;
      }

      .utimer-labels-row {
        display: contents;
      }

      .utimer-label {
        grid-row: 2;
        font-size: 14px;
        color: #6b7280;
        text-align: center;
        min-width: 3ch;
      }

      .utimer-label:nth-child(1) { grid-column: 1; }
      .utimer-label:nth-child(2) { grid-column: 3; }
      .utimer-label:nth-child(3) { grid-column: 5; }
      .utimer-label:nth-child(4) { grid-column: 7; }

      .utimer-cta {
        margin-top: 14px;
      }

      .utimer-button {
        display: inline-block;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 600;
        background: #111827;
        color: #ffffff;
        border-radius: 4px;
        text-decoration: none;
        cursor: pointer;
      }

      /* Top / Bottom Bar - compact single-row */

      .utimer-bar {
        left: 0;
        right: 0;
        padding: 4px 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: #f9fafb;
        flex-wrap: nowrap;
      }

      .utimer-bar.top {
        position: relative;
        width: 100%;
        box-sizing: border-box;
      }

      .utimer-bar.bottom {
        position: fixed;
        bottom: 0;
        z-index: 2147483000;
      }

      .utimer-bar .utimer-container {
        background: transparent;
        padding: 0;
        margin: 0;
        border: none;
        box-shadow: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        overflow: visible;
        flex-wrap: nowrap;
        width: fit-content;
        max-width: 100%;
      }

      .utimer-bar .utimer-title { font-size: 14px; font-weight: 700; margin: 0; white-space: nowrap; }
      .utimer-bar .utimer-sub { display: none; }
      .utimer-bar .utimer-countdown { margin: 0; column-gap: 2px; row-gap: 2px; }
      .utimer-bar .utimer-number, .utimer-bar .utimer-separator { font-size: 20px; font-weight: 700; }
      .utimer-bar .utimer-label { font-size: 10px; }
      .utimer-bar .utimer-cta { margin: 0; flex-shrink: 0; }
      .utimer-bar .utimer-button { padding: 6px 12px; font-size: 13px; white-space: nowrap; }

      /* Bar: stack vertically on small screens */
      @media (max-width: 768px) {
        .utimer-bar {
          padding: 4px 10px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .utimer-bar .utimer-sub { display: none; }
        .utimer-bar .utimer-container {
          flex-direction: row;
          flex-wrap: wrap;
          gap: 6px 10px;
          width: 100%;
          max-width: 100%;
          text-align: center;
          justify-content: center;
          align-items: center;
        }
        .utimer-bar .utimer-title { font-size: 16px; margin: 0; flex-shrink: 0; }
        .utimer-bar .utimer-countdown { margin: 0; row-gap: 2px; }
        .utimer-bar .utimer-number, .utimer-bar .utimer-separator { font-size: 24px; }
        .utimer-bar .utimer-label { font-size: 10px; }
        .utimer-bar .utimer-cta { flex-basis: 100%; margin: 0; display: flex; justify-content: center; }
        .utimer-bar .utimer-button { font-size: 13px; padding: 5px 12px; flex-shrink: 0; }
      }

      @media (max-width: 480px) {
        .utimer-container { padding: 20px 16px; max-width: 100%; }
        .utimer-title { font-size: 22px; }
        .utimer-sub { font-size: 14px; margin-bottom: 8px; }
        .utimer-countdown { column-gap: 2px; row-gap: 4px; }
        .utimer-number { font-size: 28px; min-width: 2ch; }
        .utimer-separator { font-size: 28px; padding: 0; }
        .utimer-label { font-size: 10px; }
        .utimer-cta { margin-top: 10px; }
        .utimer-button { font-size: 13px; padding: 6px 14px; }
      }

      @media (max-width: 360px) {
        .utimer-container { padding: 16px 12px; }
        .utimer-title { font-size: 18px; }
        .utimer-number, .utimer-separator { font-size: 24px; }
        .utimer-label { font-size: 9px; }
        .utimer-bar { padding: 4px 10px; }
        .utimer-bar .utimer-title { font-size: 16px; }
        .utimer-bar .utimer-number, .utimer-bar .utimer-separator { font-size: 22px; }
      }

      @media (prefers-color-scheme: dark) {
        .utimer-container {
          background: #0b0b0c;
          color: #e5e7eb;
        }

        .utimer-title { color: #f3f4f6; }
        .utimer-label,
        .utimer-sub,

        .utimer-bar {
          background: #0f1113;
          color: #e5e7eb;
        }

        .utimer-button {
          background: #2563eb;
        }
      }
    `;
    document.head.appendChild(style);
  }


  function init() {
     applyMinimalStyles();
    const ctx = detectContext();
    if (!ctx.shop) return;

    fetchTimersOnce(ctx).then(timers => {
      mountProductTimers(ctx, timers);
      mountBars(ctx, timers);
    });
  }

  ready(init);
})();
