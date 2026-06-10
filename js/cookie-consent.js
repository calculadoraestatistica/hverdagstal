/* hverdagstal.dk — cookie consent banner (GDPR-light)
 * Standalone, no dependencies. Loaded after main.js.
 * Stores choice in localStorage as 'htal-consent' = 'granted' | 'denied'.
 */
(function () {
  'use strict';
  const KEY = 'htal-consent';

  function read() {
    try { return localStorage.getItem(KEY); } catch (_) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (_) {}
  }

  function buildBanner() {
    const wrap = document.createElement('div');
    wrap.className = 'cookie-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Cookieindstillinger');
    wrap.innerHTML = [
      '<div class="cookie-banner__inner">',
      '  <p class="cookie-banner__text">Vi bruger cookies til at maale trafik og vise relevante annoncer. ',
      '  Du kan laese mere i vores <a href="/privatlivspolitik.html">privatlivspolitik</a>.</p>',
      '  <div class="cookie-banner__actions">',
      '    <button type="button" class="btn btn--ghost" data-cookie="deny">Afvis</button>',
      '    <button type="button" class="btn btn--primary" data-cookie="grant">Accepter alle</button>',
      '  </div>',
      '</div>'
    ].join('');
    return wrap;
  }

  function init() {
    const current = read();
    if (current === 'granted' || current === 'denied') return;
    const banner = buildBanner();
    document.body.appendChild(banner);

    banner.addEventListener('click', (e) => {
      const t = e.target.closest('[data-cookie]');
      if (!t) return;
      const action = t.getAttribute('data-cookie');
      write(action === 'grant' ? 'granted' : 'denied');
      banner.classList.add('is-hidden');
      setTimeout(() => banner.remove(), 250);
      document.dispatchEvent(new CustomEvent('htal:consent', { detail: { value: action } }));
    });
  }

  window.HverdagstalCookies = { init: init, read: read };
})();
