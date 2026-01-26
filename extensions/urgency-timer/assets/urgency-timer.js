/*!
 * Urgency Timer Storefront Script
 * - Fetches published timers from the app's public endpoint
 * - Respects scheduling (startsAt, onExpiry) and placement (product/page selection)
 * - Renders product-page timers inside extension root
 * - Renders top/bottom bar timers globally
 *
 * You can override the endpoint with:
 *   window.URGENCY_TIMER_ENDPOINT = 'https://yourapp.com/public/timers';
 *
 * The product block provides:
 *   <div class="urgency-timer-root" data-shop-domain data-product-id data-timer-id />
 */

(() => {
  const DEBUG = false;

  const STATE = {
    fetched: false,
    timers: [],
    fetchPromise: null,
  };

  const DEFAULT_ENDPOINT = "/public/timers";

  function log(...args) {
    if (DEBUG) console.log("[UrgencyTimer]", ...args);
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function getEndpoint() {
    if (typeof window !== "undefined" && window.URGENCY_TIMER_ENDPOINT) {
      return window.URGENCY_TIMER_ENDPOINT;
    }
    return DEFAULT_ENDPOINT;
  }

  function getCountry() {
    try {
      if (window.Shopify && typeof window.Shopify.country === "string") {
        return String(window.Shopify.country || "").toUpperCase();
      }
      const meta = document.querySelector('meta[name="shopify-country-code"]');
      if (meta && meta.content) return meta.content.toUpperCase();
    } catch (_) {}
    return "";
  }

  function detectPageType(root) {
    const url = String(location.href).toLowerCase();
    if (root && root.dataset && root.dataset.productId) return "product";
    if (url.includes("/cart")) return "cart";
    if (
      url === location.origin + "/" ||
      url.endsWith("/home") ||
      url.endsWith("/index")
    )
      return "home";
    return "page";
  }

  function detectContext() {
    // Prefer extension root-supplied attributes when present
    const root = document.querySelector(".urgency-timer-root");
    const shop = root?.dataset?.shopDomain || "";
    const productId = root?.dataset?.productId || "";
    const timerId = root?.dataset?.timerId || "";
    const pageType = detectPageType(root);

    // Fallback shop from Shopify global (not guaranteed)
    const shopFallback =
      (window.Shopify && window.Shopify.shop && String(window.Shopify.shop)) ||
      "";

    return {
      shop: shop || shopFallback,
      productId,
      timerId,
      pageType,
      pageUrl: location.href,
      country: getCountry(),
      collectionIds: [], // Optional (not provided by default)
      productTags: [], // Optional (not provided by default)
    };
  }

  function buildQuery(ctx) {
    const params = new URLSearchParams();
    if (ctx.shop) params.set("shop", ctx.shop);
    if (ctx.pageType) params.set("pageType", ctx.pageType);
    if (ctx.pageUrl) params.set("url", ctx.pageUrl);
    if (ctx.productId) params.set("productId", ctx.productId);
    if (ctx.country) params.set("country", ctx.country);
    if (ctx.collectionIds?.length)
      params.set("collectionIds", ctx.collectionIds.join(","));
    if (ctx.productTags?.length)
      params.set("productTags", ctx.productTags.join(","));
    return params.toString();
  }

  function fetchTimersOnce(ctx) {
    if (STATE.fetchPromise) return STATE.fetchPromise;

    const endpoint = getEndpoint();
    const qs = buildQuery(ctx);
    const url = `${endpoint}${endpoint.includes("?") ? "&" : "?"}${qs}`;

    log("Fetching timers from", url);
    STATE.fetchPromise = fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch timers (${r.status})`);
        return r.json();
      })
      .then((data) => {
        const timers = Array.isArray(data?.timers) ? data.timers : [];
        STATE.timers = timers;
        STATE.fetched = true;
        log("Fetched timers:", timers);
        return timers;
      })
      .catch((err) => {
        log("Fetch error:", err);
        STATE.timers = [];
        STATE.fetched = true;
        return [];
      });

    return STATE.fetchPromise;
  }

  function msUntil(date) {
    const now = Date.now();
    const target = new Date(date).getTime();
    return target - now;
  }

  function getFixedTimerRemainingSeconds(timer) {
    const key = `utimer_fixed_${timer.id}_startedAt`;
    let startedAt = localStorage.getItem(key);
    const ttl = (timer.fixedMinutes || 0) * 60;
    const nowSec = Math.floor(Date.now() / 1000);
    if (!startedAt) {
      startedAt = String(nowSec);
      localStorage.setItem(key, startedAt);
    }
    const elapsed = nowSec - Number(startedAt);
    return Math.max(0, ttl - elapsed);
  }

  function formatDHMS(totalSeconds) {
    const total = Math.max(0, Math.floor(totalSeconds));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return { days, hours, minutes, seconds };
  }

  function pad(n) {
    return n < 10 ? `0${n}` : String(n);
  }

  function createCountdownDOM(timer) {
    const container = document.createElement("div");
    container.className = "utimer-container";

    const title = document.createElement("div");
    title.className = "utimer-title";
    title.textContent = timer.title || "";

    const sub = document.createElement("div");
    sub.className = "utimer-sub";
    sub.textContent = timer.subheading || "";

    const countdown = document.createElement("div");
    countdown.className = "utimer-countdown";

    const units = ["days", "hours", "minutes", "seconds"];
    const labels = [
      timer.daysLabel || "Days",
      timer.hoursLabel || "Hrs",
      timer.minutesLabel || "Mins",
      timer.secondsLabel || "Secs",
    ];

    const valueEls = {};
    units.forEach((unit, idx) => {
      const unitEl = document.createElement("div");
      unitEl.className = "utimer-unit";

      const numEl = document.createElement("span");
      numEl.className = "utimer-number";
      numEl.textContent = "00";

      const labelEl = document.createElement("span");
      labelEl.className = "utimer-label";
      labelEl.textContent = labels[idx];

      unitEl.appendChild(numEl);
      unitEl.appendChild(labelEl);
      countdown.appendChild(unitEl);
      valueEls[unit] = numEl;
    });

    const ctaWrapper = document.createElement("div");
    ctaWrapper.className = "utimer-cta";

    if (timer.ctaType === "button" && timer.buttonText && timer.buttonLink) {
      const btn = document.createElement("a");
      btn.className = "utimer-button";
      btn.href = timer.buttonLink;
      btn.textContent = timer.buttonText;
      ctaWrapper.appendChild(btn);
    }

    // Minimal inline styles to ensure visibility without CSS
    applyMinimalStyles(container);

    container.appendChild(title);
    if (timer.subheading) container.appendChild(sub);
    container.appendChild(countdown);
    if (ctaWrapper.childNodes.length) container.appendChild(ctaWrapper);

    // Update loop
    let intervalId = 0;
    function update() {
      let remainingSeconds = 0;
      if (String(timer.timerType).toLowerCase() === "countdown" && timer.endDate) {
        const ms = msUntil(timer.endDate);
        remainingSeconds = Math.max(0, Math.floor(ms / 1000));
      } else if (String(timer.timerType).toLowerCase() === "fixed") {
        remainingSeconds = getFixedTimerRemainingSeconds(timer);
      } else {
        remainingSeconds = 0;
      }

      const { days, hours, minutes, seconds } = formatDHMS(remainingSeconds);
      valueEls.days.textContent = pad(days);
      valueEls.hours.textContent = pad(hours);
      valueEls.minutes.textContent = pad(minutes);
      valueEls.seconds.textContent = pad(seconds);

      const ended =
        remainingSeconds <= 0 ||
        Boolean(timer.ended) ||
        (String(timer.timerType).toLowerCase() === "countdown" &&
          timer.endDate &&
          new Date(timer.endDate).getTime() <= Date.now());

      if (ended) {
        // Respect onExpiry
        const behavior = String(timer.onExpiry || "unpublish").toLowerCase();
        if (behavior === "unpublish" || behavior === "hide") {
          clearInterval(intervalId);
          container.style.display = "none";
        } else if (behavior === "keep") {
          // Keep displayed at 00:00:00
          clearInterval(intervalId);
        }
      }
    }

    intervalId = window.setInterval(update, 1000);
    update();

    return container;
  }

  function applyMinimalStyles(container) {
    // Only apply once per page
    const id = "utimer-minimal-style";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        .utimer-container { padding: 12px; border: 1px solid #e5e5e5; border-radius: 6px; background: #fff; color: #1f2937; max-width: 720px; }
        .utimer-title { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
        .utimer-sub { font-size: 14px; color: #4b5563; margin-bottom: 8px; }
        .utimer-countdown { display: flex; gap: 12px; align-items: center; }
        .utimer-unit { display: flex; flex-direction: column; align-items: center; min-width: 56px; }
        .utimer-number { font-size: 22px; font-weight: 700; }
        .utimer-label { font-size: 12px; color: #6b7280; }
        .utimer-cta { margin-top: 10px; }
        .utimer-button { display: inline-block; padding: 8px 12px; background: #111827; color: #fff; border-radius: 4px; text-decoration: none; }
        .utimer-bar { position: fixed; left: 0; right: 0; padding: 10px 16px; display: flex; justify-content: center; align-items: center; gap: 16px; z-index: 2147483000; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .utimer-bar.top { top: 0; }
        .utimer-bar.bottom { bottom: 0; }
        .utimer-bar .utimer-close { position: absolute; right: 12px; top: 8px; cursor: pointer; font-size: 18px; line-height: 1; }
        .utimer-bar .utimer-button { background: #111827; color: #fff; }
      `;
      document.head.appendChild(style);
    }

    // Apply simple design overrides if present
    const dc = timerDesignConfigFromContainer(container);
    if (dc) {
      if (dc.backgroundColor) container.style.background = dc.backgroundColor;
      if (dc.titleColor)
        container.style.setProperty("--utimer-title-color", dc.titleColor);
      if (dc.timerColor)
        container.style.setProperty("--utimer-number-color", dc.timerColor);
    }
  }

  function timerDesignConfigFromContainer(_c) {
    // Placeholder to allow extension later; currently not reading from DOM
    return null;
  }

  function mountProductTimers(ctx, timers) {
    const roots = document.querySelectorAll(".urgency-timer-root");
    if (!roots || roots.length === 0) return;

    roots.forEach((root) => {
      try {
        const timerId = root?.dataset?.timerId || "";
        let list = timers.filter((t) => t.type === "product-page");

        if (timerId) {
          list = list.filter((t) => String(t.id) === String(timerId));
        }

        if (list.length === 0) {
          log("No product-page timers for this root");
          return;
        }

        // Mount the first matching timer
        const t = list[0];
        const mount = createCountdownDOM(t);

        // If CTA type is clickable, wrap container in anchor if link present
        if (t.ctaType === "clickable" && t.buttonLink) {
          const a = document.createElement("a");
          a.href = t.buttonLink;
          a.style.textDecoration = "none";
          a.style.color = "inherit";
          a.appendChild(mount);
          root.innerHTML = "";
          root.appendChild(a);
        } else {
          root.innerHTML = "";
          root.appendChild(mount);
        }
        try {
          const payload = JSON.stringify({
            shop: ctx.shop,
            timerId: t.id,
            pageUrl: ctx.pageUrl,
            pageType: ctx.pageType,
            productId: ctx.productId || undefined,
            country: ctx.country || undefined,
          });
          if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: "application/json" });
            navigator.sendBeacon("/public/views", blob);
          } else {
            fetch("/public/views", {
              method: "POST",
              mode: "cors",
              credentials: "omit",
              headers: { "Content-Type": "application/json" },
              body: payload,
            }).catch(() => {});
          }
        } catch (_e) {}
      } catch (err) {
        log("Mount product timer error:", err);
      }
    });
  }

  function mountBars(ctx, timers) {
    // Top/bottom bars rendered globally
    const bars = timers.filter((t) => t.type === "top-bottom-bar");
    bars.forEach((t) => {
      try {
        const bar = document.createElement("div");
        bar.className = "utimer-bar";

        // Positioning
        const positioning = (t.designConfig?.positioning || "top").toLowerCase();
        bar.classList.add(positioning === "bottom" ? "bottom" : "top");

        // Colors
        if (t.designConfig?.backgroundColor) {
          bar.style.background = t.designConfig.backgroundColor;
        } else {
          bar.style.background = "#f9fafb";
        }
        bar.style.color = t.designConfig?.timerColor || "#111827";

        // Close button
        const close = document.createElement("span");
        close.className = "utimer-close";
        close.textContent = "×";
        close.addEventListener("click", () => {
          bar.remove();
        });
        bar.appendChild(close);

        // Content
        const content = createCountdownDOM(t);
        content.style.boxShadow = "none";
        content.style.border = "none";
        content.style.background = "transparent";
        content.style.margin = "0";
        bar.appendChild(content);

        // CTA button inline for bars if button type
        if (t.ctaType === "button" && t.buttonText && t.buttonLink) {
          const cta = document.createElement("a");
          cta.className = "utimer-button";
          cta.href = t.buttonLink;
          cta.textContent = t.buttonText;
          bar.appendChild(cta);
        }

        if (t.ctaType === "clickable" && t.buttonLink) {
          bar.style.cursor = "pointer";
          bar.addEventListener("click", (e) => {
            const target = e.target;
            if (target && target.classList && target.classList.contains("utimer-close")) return;
            location.href = t.buttonLink;
          });
        }

        document.body.appendChild(bar);
        try {
          const payload = JSON.stringify({
            shop: ctx.shop,
            timerId: t.id,
            pageUrl: ctx.pageUrl,
            pageType: ctx.pageType,
            productId: ctx.productId || undefined,
            country: ctx.country || undefined,
          });
          if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: "application/json" });
            navigator.sendBeacon("/public/views", blob);
          } else {
            fetch("/public/views", {
              method: "POST",
              mode: "cors",
              credentials: "omit",
              headers: { "Content-Type": "application/json" },
              body: payload,
            }).catch(() => {});
          }
        } catch (_e) {}
      } catch (err) {
        log("Mount bar error:", err);
      }
    });
  }

  function init() {
    const ctx = detectContext();
    if (!ctx.shop) {
      log("Shop domain not available; timers will not load.");
      return;
    }

    fetchTimersOnce(ctx).then((timers) => {
      if (!Array.isArray(timers) || timers.length === 0) {
        log("No timers available for this context.");
        return;
      }
      // Mount product timers into provided roots
      mountProductTimers(ctx, timers);
      // Mount top/bottom bars across the page
      mountBars(ctx, timers);
    });
  }

  ready(init);
})();
