# Hverdagstal CSS — Class Reference

Use ONLY these classes. Do not invent new ones unless extending an existing component with a `--modifier`. Mobile-first; breakpoints: `min-width: 640px` (sm), `min-width: 860px` (md), `min-width: 1024px` (lg).

## Layout

### `.container`
Max-width wrapper, 1100px, lateral padding scales with viewport. Use on every section.
```html
<div class="container">…</div>
```

### `.section`
Vertical spacing block; pair with `.container` inside.
```html
<section class="section"><div class="container">…</div></section>
```

### `.section--alt`
Light teal-tinted background for alternating sections.
```html
<section class="section section--alt"><div class="container">…</div></section>
```

### `.site-grid`
2-column responsive grid (1 col mobile, 2 col md+).
```html
<div class="site-grid"><div>…</div><div>…</div></div>
```

### `.cluster`
Horizontal flex with wrap and gap; used for tag rows, button rows.
```html
<div class="cluster"><a class="btn btn--ghost">A</a><a class="btn btn--ghost">B</a></div>
```

### `.stack`
Vertical flow with consistent gap between children.
```html
<div class="stack">…</div>
```

## Header

### `.site-header`
Sticky white header, ~64px tall, subtle border-bottom.
```html
<header class="site-header">…</header>
```

### `.site-header__inner`
Inner flex container (brand + nav-toggle + nav).

### `.brand`
Logo + name. Always link to `/`.
```html
<a class="brand" href="/" aria-label="Hverdagstal forside">…</a>
```

### `.brand__mark`
Wrapper for inline SVG logo (28x28).

### `.brand__name`
The wordmark text; second span styled in accent gold.
```html
<span class="brand__name">Hverdags<span>tal</span></span>
```

### `.header-badge`
Small gold pill, "Opdateret YYYY-MM-DD". Hidden on mobile.

### `.nav-toggle`
Hamburger button, visible only on mobile.
```html
<button class="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Aabn menu">…</button>
```

### `.main-nav`
Horizontal `<nav>` desktop, drawer mobile.
```html
<nav class="main-nav" id="main-nav"><ul>…</ul></nav>
```

### `.main-nav a[aria-current="page"]`
Current page link styled with teal underline.

### `.skip-link`
Hidden until focused. First element in `<body>`.
```html
<a class="skip-link" href="#main">Spring til indhold</a>
```

## Hero

### `.hero`
Teal-to-white gradient block at top of pages.
```html
<section class="hero"><div class="container">…</div></section>
```

### `.hero__eyebrow`
Small uppercase label above H1.

### `.hero__title`
The big H1.

### `.hero__lead`
Lead paragraph below H1.

### `.opdateret-badge`
Discreet gold chip, dates the page.
```html
<span class="opdateret-badge">Opdateret 2026-06-10</span>
```

## Buttons

### `.btn`
Base. Use with one variant.

### `.btn--primary`
Solid teal, white text. Main CTA.
```html
<a class="btn btn--primary" href="/beregner/su.html">Beregn din SU</a>
```

### `.btn--ghost`
Transparent border, teal text.

### `.btn--lg`
Larger padding/font size. Use sparingly (hero CTA).
```html
<a class="btn btn--primary btn--lg" href="…">…</a>
```

## Calculator

### `.calculator-form`
Grid form: 1 col mobile, 2 col md+. Wrap in `<form>`.
```html
<form class="calculator-form">
  <div class="field"><label for="x">…</label><input id="x" type="number"></div>
</form>
```

### `.field`
Single label+input wrapper inside `.calculator-form`.

### `.field--full`
Span both columns.

### `.field__hint`
Muted helper text below input.

### `.field__error`
Red error text; toggle with `hidden`.

### `.calculator-result`
Teal-tinted card with the computed breakdown.
```html
<aside class="calculator-result" aria-live="polite">
  <h2>Resultat</h2>
  <dl class="calculator-result__breakdown">…</dl>
  <p class="calculator-result__total"><span>I alt</span><strong>12.345 kr</strong></p>
</aside>
```

### `.calculator-result__breakdown`
Definition list, term left + value right.

### `.calculator-result__total`
Big teal row, totals.

## FAQ

### `.faq`
Wrapper for FAQ section.
```html
<section class="faq">
  <h2>Ofte stillede spoergsmaal</h2>
  <details><summary>Hvor meget SU faar jeg?</summary><p>…</p></details>
</section>
```

## Source cards

### `.source-card`
Light gray card listing official sources with external-link icons.
```html
<div class="source-card">
  <h3>Officielle kilder</h3>
  <ul>
    <li><a href="https://www.su.dk" rel="nofollow noopener" target="_blank">su.dk <span class="ext-icon" aria-hidden="true">↗</span></a></li>
  </ul>
</div>
```

## Hub cards (situation pages)

### `.hub-grid`
Responsive grid of `.hub-card`s.

### `.hub-card`
Single calculator card with title, blurb, CTA.
```html
<a class="hub-card" href="/beregner/su.html">
  <h3>SU-beregner</h3>
  <p>Hvor meget SU efter skat?</p>
  <span class="hub-card__cta">Beregn nu →</span>
</a>
```

## Cross-link

### `.cross-link`
Inline external link to sister site.
```html
<p>Brug for nettoloen? Brug <a class="cross-link" href="https://lonberegning.dk" rel="noopener">lonberegning.dk <span class="ext-icon">↗</span></a>.</p>
```

## Breadcrumbs

### `.breadcrumbs`
Above page title; ol with chevron separators.
```html
<nav class="breadcrumbs" aria-label="Brodkrumme">
  <ol><li><a href="/">Forside</a></li><li aria-current="page">SU-beregner</li></ol>
</nav>
```

## Ad slots

### `.ad-slot`
Reserved AdSense container. Always include a label.
```html
<div class="ad-slot" aria-label="Annonce">
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-7516029395999799" data-ad-slot="…" data-ad-format="auto" data-full-width-responsive="true"></ins>
</div>
```

### `.ad-slot--inline`
Use between content blocks (max 728x90 visual).

### `.ad-slot--rail`
Sidebar / desktop only.

## Footer

### `.site-footer`
Dark teal footer.

### `.site-footer__cols`
6-column grid (responsive: 2 on sm, 3 on md, 6 on lg).

### `.site-footer__col h2`
Column heading.

### `.site-footer__bottom`
Bottom strip with copyright.

## Misc

### `.badge`
Inline small pill.
```html
<span class="badge badge--gold">2026-satser</span>
```

### `.muted`
De-emphasized text color.

### `.visually-hidden`
Visually hide but keep for screen readers.

### `.ext-icon`
Decorative external-link glyph (↗).

### `.cookie-banner`
Injected by cookie-consent.js. Do not place manually.

## Accessibility patterns

- Always wire `aria-expanded` on toggleable controls.
- Use `aria-current="page"` on the active nav link.
- Calculator result containers should have `aria-live="polite"`.
- All form `<input>` must have a `<label for>` (no orphaned inputs).
- Color-only signals are not enough; add text or icon as well.
