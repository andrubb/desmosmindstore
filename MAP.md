# DESMOS MIND — STRUCTURAL MAP (audit snapshot, 2026-07-03)

> Read-only audit deliverable. Generated from a full top-to-bottom read of `index.html`
> (~896 KB; CSS lines 89–10840, markup 10877–17632, JS in three blocks ending ~19242).
> Line numbers use the Read-tool numbering from the audit session and drift with edits —
> treat them as locators, not anchors.

## 1. FILE LAYOUT

| Range (approx) | Contents |
|---|---|
| 1–88 | `<head>`: SEO meta, PWA manifest, favicons (base64), OG/Twitter meta (**images are base64 data URIs — crawlers ignore them**), preconnects, Google Fonts (Bebas Neue + **Barlow/Barlow Condensed** — comments claim "Inter" but body font is Barlow), Schema.org Store JSON-LD |
| 89–10840 | ONE `<style>` block (~10,750 lines) — see §4 layer archaeology |
| 10842–10875 | Deferred GSAP + ScrollTrigger (jsdelivr) + `gsapReady()` gate; Plausible (+queue stub, `track()`) |
| 10877–17632 | `<body>` markup + main JS block (12307–17393) |
| 17634–19242 | Particles JS, i18n/ticker/exit-intent, stats count-up, modal swipe, tilt, PTR, hash routing, PWA SW, tab bar, loader, cursor, countdowns, `gsapEnhancements`, PART-2 mobile details |

Monster lines (base64 blobs): 26/27/28 favicons · 37 og:image · 46 twitter:image · 11056 hero bat SVG (Inkscape-made).

## 2. DOM ORDER (with what animates each section)

| # | Element / Section | id | Animations attached |
|---|---|---|---|
| 0 | `#scroll-progress` (fixed, z9999) | — | rAF scaleX on scroll (vanilla) |
| 1 | `#page-loader` (fixed, z999999) | — | loader-bat-pulse, loader-fill (infinite until dismiss ≤3s) |
| 2 | `#cursor-dot` / `#cursor-bat` (fixed, z99999) | — | rAF damped follow; cursor-flap on hover (desktop ≥900px only) |
| 3 | `#ptr-indicator` (fixed, z580) | — | ptr-spin while refreshing (touch only) |
| 4 | `#ticker-bar` (fixed top, z600) | — | ticker-shimmer (bg-pos, infinite); msg rotate via class every 4s (setInterval) |
| 5 | `#navbar` (fixed, z500, will-change:transform) | — | .scrolled toggle (passive rAF scroll listener) |
| 6 | `#mob-overlay` (z590) / `#mob-drawer` (z600) | — | translateX CSS transition |
| 7 | **HERO** `section.hero` | `inicio` | CSS-only: topglow, glowPulse, hero-scan (desktop; animates `top`), glitch-top/bot-**pro** (title, `!important`, keeps 2.6s even on mobile), mind-breathe (4s text-shadow), svgFloat+svgGlow (bat; **animation:none on mobile**), bounce (scroll-hint), bloodDrip particles (JS-injected divs), canvas particles (rAF; **disabled <768px / <4 cores / reduced-motion**), entrance: desktop `.hero-content > *` fade-up nth-child staggers; mobile heroRise keyframes `!important`. Contains `hero-vignette/ambient/grain` divs (**no CSS — dead markup**) |
| 8 | `.brands-band` marquee | — | marquee-scroll 25s (translateX −50%, hover pause). Rebuilt by `renderMarquee()` on Supabase brands |
| 9 | `section.trust-band` | — | `.reveal` (IO) + trust-item slide-in `.slid` (IO, PART-2) |
| 10 | `section.drops-section` | `drops` | Slides opacity crossfade (CSS 0.8s) + 8s Ken-Burns img transform; 5s autoplay setInterval; progress bar width transition (desktop; hidden mobile); dots/arrows; JS-rendered (`renderDropSlider`) |
| 11 | `section.categories` | `categorias` | `.reveal` (IO); **GSAP** grid stagger (initScrollReveal); cat-card cursor tilt (gsapEnhancements 47.8, desktop); scroll-parallax tilt rAF (initCategoryParallax, desktop); JS-rendered |
| — | `div.divider` ×4 between sections | — | GSAP scaleX pop-in (47.4) + IO `.drawn` class (PART-2) — **two systems on same element**; hidden entirely on mobile |
| 12 | `section.how-section` (two-path explainer + steps) | `catalogo` | `.reveal` (IO) + GSAP grid stagger |
| 13 | `section.recent-section` (display:none until ≥2 items) | `recent-viewed-section` | hover-only transitions; JS-rendered |
| — | `#prod-modal` (luxury) z700 | — | modalSlideIn / mobile image-first rebuild; swipe gestures (touch); GSAP img crossfade |
| — | `#quick-view-modal` z800 | — | qv-rise |
| 14 | `section.products-section.editorial-drop` | `stock` | drop-header `.reveal`; **GSAP** ScrollTrigger.batch('.prod-card, .featured-hero'); card hover: scan-line (translateY), img crossfade, lookbook 3-img cycle, quick-add, tilt (initProductTilt rAF, desktop); tap ripple (touch); skeletons while loading; JS-rendered |
| 15 | `div.cta-band` | — | cta-scan (animates `left`, infinite), cta-underline (once), GSAP title scale-in (47.5) |
| 16 | `section.testimonials` | `testimonios` | `.reveal` + GSAP grid stagger; mobile: scroll-snap carousel; JS re-rendered (`renderReviews`) |
| 17 | `section.editorial-section` | `editorial` | `.reveal` + GSAP grid stagger; hover tilt (47.3 GSAP, desktop); **bg-position parallax scrub (47.6, desktop only)**; ec-image = background-image divs |
| 18 | `section.faq` | `faq` | `.reveal`; accordion: GSAP height animate w/ vanilla fallback |
| 19 | `section.contact-section` | `contacto` | `.reveal` + hover transitions |
| 20 | `footer` (manifesto/grid/payments/legal) | — | hover transitions only |
| — | `#toast` z900 · admin panel z700 · form modals z900/z1200 · search z850 · auth/exit `ei-modal` z950 · cart panel z600/overlay z599 · `#bottom-tabs` z500 · `#wa-float` z450 · `#cart-btn` z400 (desktop FAB) | | |

Every non-hero `<section>` additionally gets a **GSAP section fade-up** (initScrollReveal adds `.reveal-section` + fromTo, start `top 94%`, once).

## 3. SCROLLTRIGGER INVENTORY (Phase 1)

**Active pins: 0.** No `pin:` anywhere. No scrub-pinned mechanics. (Hero scroll-stage/bat-scroll were removed; shim selectors remain as documented no-ops.)

| # | Creator | Targets | Config | Layout-affecting? |
|---|---|---|---|---|
| 1 | initScrollReveal | every `section:not(.hero)` (~10) | fromTo opacity/y, start `top 94%`, once | transform/opacity only |
| 2 | initScrollReveal | 6 grids' children (stagger, capped) | start `top 92%`, once | transform/opacity |
| 3 | initScrollReveal | `ScrollTrigger.batch('.prod-card, .featured-hero')` | start `top 95%`, once | transform/opacity |
| 4 | gsapEnhancements 47.4 | each `.divider` (×4–5) | from scaleX:0, start `top 92%`, once | transform |
| 5 | gsapEnhancements 47.5 | `.cta-band-title` | from scale/opacity, once | transform/opacity |
| 6 | gsapEnhancements 47.6 | 3× `.ec-image` | **scrub:true**, backgroundPositionY (desktop only) | bg-paint per frame (desktop) |

Boot order: #1–3 at DOMContentLoaded (gsapReady); #4–6 on first interaction / 3.5s idle (gsapEnhancements warm). Creation order across the two boots is **not** page order; no `refreshPriority`, no `ScrollTrigger.sort()`, **no `ScrollTrigger.refresh()` anywhere**, no `gsap.matchMedia` (hand-rolled `matchMedia().matches` consts at boot), no `gsap.context` (single-page, nothing unmounts). **No ResizeObserver anywhere** (the sister-project refresh-loop bug class is absent).

Other GSAP consumers: magnetic buttons (quickTo, desktop), FAQ height animate, modal image crossfade. Three MutationObservers (magnetic rescan on `body` subtree; grid re-stagger; product tilt re-attach).

## 4. CSS LAYER ARCHAEOLOGY (cascade order)

base → FINAL POLISH (~2263) → GOTHIC DEPTH (~2848) → GOTHIC R2 (~3171) → FEATUREs 1–45 → VISUAL OVERHAUL v3 “46” (~6405, token system) → SURGICAL 48 (FAQ/test/contact/footer/CTA) → 49 products+modal → 50 glitch/drops → 51 polish → PREMIUM POLISH LAYER (~9264, **written partly against imagined markup — largest dead-CSS source**) → MOBILE HERO REDESIGN (~9930) → MOBILE AUDIT (~10201) → MOBILE TYPO (~10374) → **MOBILE PERF PASS (~10461 — the 0.3s animation cap lives here)** → MOBILE QUALITY (~10547) → GLOBAL BUTTON REDESIGN (~10592) → PART 2 (~10654) → MOBILE SIZE PASS “authoritative final word” (~10756).

Multiply-defined (later wins): `section` padding ×4, `.products-grid` ×3, `.cat-grid/.cat-card` ×3, `.modal-inner`+entrance ×3 (modalIn→modalSlideIn→mobile modalSlideUp), `#prod-modal` z800→z700, scrollbar ×3, `::selection` ×3, `body::after` **vignette→grain (vignette dead)**, hero entrance titleReveal→`.hero-content>*` fade-up→mobile heroRise.

## 5. KNOWN-DEAD CSS / MARKUP (verified by cross-grep — safe to prune in a cleanup pass)

- Selectors matching nothing: `#hero` (hero is `#inicio`), `.ticker-text`, `.admin-tab`, `#page-loader .loader-logo`, `.review-card` (uses `.test-card`), `.sec-index`, `.cat-label`, `.trust-label`, `.drop-tag` (uses `.drop-slide-tag`), `.category-card`, `.testimonial-card`, `.prod-card-meta`, `.tilt-3d`, `[data-tilt]`, `[data-parallax]`, `.parallax`, `.prod-sale`, `.prod-img`, `.reveal-item`, `.skeleton`/`skeletonShimmer` (7f block — JS uses `.skel-*`), `.hero-logo-badge/.hero-logo-img` (element not in DOM; its perf-pass exemption is dead too)
- Orphaned keyframes: `svgAtmoReveal`, `breathe`, `waPulse`, `add-success-shake`, `glitch-top`/`glitch-bot` (superseded by `-pro` via `!important`), `modalIn` (superseded), `fadeUp` (only hero-eyebrow, which is display:none on mobile — alive on desktop)
- Dead markup: `.hero-vignette` / `.hero-ambient` / `.hero-grain` divs (no CSS at all); duplicate `style` attribute on `#df-tag-custom-wrap` (invalid HTML; JS compensates)
- Syntax error: `.cat-card::before` transition has a stray `)` — declaration dropped, underline snaps instead of animating
- No-op shims kept intentionally: `.hero-scroll-stage`,`.hero-sticky` (`display:contents`)
- Unused deployed files: 5× `assets/Gemini_Generated_Image_*.png` (**AI-generated — standing-rule violation; referenced nowhere; delete in next pass**)

## 6. DATA / BOOT FLOW (for animation-timing context)

Boot: renderProducts(skeletons) → renderReviews/renderCategories (cached/localStorage) → initDrops (cache→Supabase) → loadCart → `loadAllData()` (**sequential await waterfall**: products→site_content→brands→reviews→categories) → re-renders each. GSAP triggers are created at DOMContentLoaded — **before** Supabase content lands; no refresh() afterwards. Reveal resilience: `.reveal` system is IO-based with a 1.4s failsafe; the GSAP `.reveal-section` fade has **no failsafe** (section stays opacity:0 if its stale trigger start is never crossed).

Always-on timers: drops autoplay 5s, ticker rotate 4s, countdown tick 1s, social-proof drift (per render).
