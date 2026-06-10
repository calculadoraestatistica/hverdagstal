/* hverdagstal.dk — base interactivity
 * Vanilla JS, no dependencies. Loaded on every page.
 * - Mobile nav toggle (drawer)
 * - FAQ accordion (details/summary enhancement + smooth animation)
 * - Currency formatter helper (DKK, da-DK)
 * - localStorage helpers gated by cookie consent
 * - Cookie banner wiring (works with cookie-consent.js if loaded)
 */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ---------- DKK formatter ---------- */
  const dkkFormatter = new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    maximumFractionDigits: 0
  });
  const dkkFormatterDec = new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  function formatDKK(value, withDecimals) {
    if (typeof value !== 'number' || !isFinite(value)) return '—';
    return withDecimals ? dkkFormatterDec.format(value) : dkkFormatter.format(Math.round(value));
  }
  function formatNumber(value, decimals) {
    if (typeof value !== 'number' || !isFinite(value)) return '—';
    return new Intl.NumberFormat('da-DK', {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0
    }).format(value);
  }

  /* ---------- consent-aware storage ---------- */
  function hasConsent() {
    try { return localStorage.getItem('htal-consent') === 'granted'; }
    catch (_) { return false; }
  }
  function safeSet(key, value) {
    if (!hasConsent()) return false;
    try { localStorage.setItem(key, value); return true; } catch (_) { return false; }
  }
  function safeGet(key) {
    if (!hasConsent()) return null;
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  /* ---------- mobile nav toggle ---------- */
  function initNavToggle() {
    const btn = $('.nav-toggle');
    const nav = $('#main-nav') || $('.main-nav');
    if (!btn || !nav) return;

    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    }

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
    });

    // Close on link click (mobile)
    $$('a', nav).forEach((a) => {
      a.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 859px)').matches) setOpen(false);
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });

    // Reset on resize to desktop
    let lastWide = window.matchMedia('(min-width: 860px)').matches;
    window.addEventListener('resize', () => {
      const wide = window.matchMedia('(min-width: 860px)').matches;
      if (wide !== lastWide) {
        lastWide = wide;
        if (wide) setOpen(false);
      }
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaqAccordion() {
    $$('.faq details').forEach((d) => {
      const summary = d.querySelector('summary');
      if (!summary) return;
      summary.setAttribute('role', 'button');
      summary.setAttribute('aria-expanded', d.open ? 'true' : 'false');
      d.addEventListener('toggle', () => {
        summary.setAttribute('aria-expanded', d.open ? 'true' : 'false');
      });
    });
  }

  /* ---------- copy-link buttons (deep links) ---------- */
  function initCopyLinks() {
    $$('[data-copy-link]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const url = btn.getAttribute('data-copy-link') || window.location.href;
        try {
          await navigator.clipboard.writeText(url);
          const old = btn.textContent;
          btn.textContent = 'Kopieret!';
          setTimeout(() => { btn.textContent = old; }, 1500);
        } catch (_) { /* noop */ }
      });
    });
  }

  /* ---------- expose globally ---------- */
  window.Hverdagstal = Object.assign(window.Hverdagstal || {}, {
    formatDKK: formatDKK,
    formatNumber: formatNumber,
    hasConsent: hasConsent,
    safeSet: safeSet,
    safeGet: safeGet,
    $: $, $$: $$
  });

  /* ---------- boot ---------- */
  ready(() => {
    initNavToggle();
    initFaqAccordion();
    initCopyLinks();
    // Cookie banner is wired by cookie-consent.js if loaded.
    if (typeof window.HverdagstalCookies?.init === 'function') {
      window.HverdagstalCookies.init();
    }
  });
})();
