---
name: DESMOSMIND
description: Gothic gym-wear importer storefront for Costa Rica — black steel, blood red, chamfered edges.
colors:
  blood-red: "#DC1111"
  blood-bright: "#ff2222"
  blood-dim: "#a50d0d"
  abyss-bg: "#050505"
  abyss-2: "#090909"
  abyss-3: "#0e0e0e"
  bone-white: "#f0ece4"
  ash-text: "#d4d0c8"
  ash-muted: "#82827a"
  ash-faint: "#626258"
  hairline-white: "rgba(255,255,255,0.06)"
  hairline-red: "rgba(220,17,17,0.18)"
typography:
  display:
    fontFamily: "'Bebas Neue', sans-serif"
    fontSize: "clamp(4rem, 11vw, 9rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0.06em"
  headline:
    fontFamily: "'Bebas Neue', sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.2rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "0.06em"
  title:
    fontFamily: "'Bebas Neue', sans-serif"
    fontSize: "clamp(1.2rem, 2vw, 1.6rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.06em"
  body:
    fontFamily: "'Barlow', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "'Barlow', sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.18em"
rounded:
  none: "0px"
spacing:
  section: "clamp(4rem, 8vw, 8rem)"
  card: "1.5rem"
  tight: "0.5rem"
components:
  button-primary:
    backgroundColor: "{colors.blood-red}"
    textColor: "{colors.bone-white}"
    rounded: "{rounded.none}"
    typography: "{typography.label}"
    padding: "1rem 2.5rem"
  button-primary-hover:
    backgroundColor: "{colors.blood-bright}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.bone-white}"
    rounded: "{rounded.none}"
    padding: "1rem 2.5rem"
---

# Design System: DESMOSMIND

## 1. Overview

**Creative North Star: "The Midnight Armory"**

Gym-wear presented as armor in a night forge: vast near-black surfaces, one blood-red blade of accent, hard chamfered edges cut with `clip-path` instead of border-radius, and controlled industrial motion (scanlines, glitch, Ken-Burns drift). The system rejects everything soft — no rounded corners, no pastels, no cream minimalism, no serif elegance. Intensity comes from restraint: enormous condensed uppercase type on empty black, with red spent only where it draws blood.

This system explicitly rejects (from PRODUCT.md): generic SaaS landing patterns, Shopify/dropshipper clutter, editorial-magazine serif affectation, and neon cyberpunk. Red is blood, not laser.

**Key Characteristics:**
- Near-black canvas in three steps (#050505 / #090909 / #0e0e0e), hairline white borders for structure
- Single chromatic voice: #DC1111 and its two siblings, nothing else colored
- Bebas Neue condensed uppercase display vs. Barlow workhorse body — contrast by width and case, not by serif
- Chamfered (clip-path) corners as the signature shape language; radius is always 0
- Motion is industrial: scan, glitch, drift, stitch — never bounce, never elastic

## 2. Colors

A monochrome abyss with one weapon: black carries the world, red carries the intent.

### Primary
- **Blood Red** (#DC1111): CTAs, live indicators, drop urgency, glitch accents, the bat. The only saturated voice on the page.
- **Blood Bright** (#ff2222): hover/active states of Blood Red elements only.
- **Blood Dim** (#a50d0d): pressed states, deep red borders, exhausted urgency.

### Neutral
- **Abyss** (#050505): the body background. The page IS this color.
- **Abyss 2 / Abyss 3** (#090909 / #0e0e0e): raised surfaces (cards, panels, drawers) — depth by tonal step, not shadow.
- **Bone White** (#f0ece4): headings and high-emphasis text. Never pure #fff.
- **Ash** (#d4d0c8): body text (≥4.5:1 on Abyss).
- **Ash Muted / Ash Faint** (#82827a / #626258): metadata and labels only, never body copy.
- **Hairline White** (rgba(255,255,255,0.06)): structural borders and dividers.
- **Hairline Red** (rgba(220,17,17,0.18)): borders on red-charged elements.

### Named Rules
**The One Blade Rule.** Red (#DC1111 family) is the only chroma permitted anywhere. If a design wants a second color, the answer is a different lightness of red or a neutral.
**The No-Daylight Rule.** No surface rises above #0e0e0e. Light exists only as text, hairlines, and glow.

## 3. Typography

**Display Font:** Bebas Neue (with sans-serif fallback)
**Body Font:** Barlow (with sans-serif fallback) — *note: legacy code comments claim "Inter"; the shipped font is Barlow*
**Condensed Label Font:** Barlow Condensed (used for tags/eyebrows in some sections)

**Character:** A war poster: towering condensed uppercase display against a quiet, highly-legible grotesque body. Contrast comes from width, case, and scale — never from a serif.

### Hierarchy
- **Display** (400, clamp(4rem, 11vw, 9rem), 0.95): hero title only.
- **Headline** (400, clamp(2rem, 4vw, 3.2rem), 1.05): section titles, uppercase.
- **Title** (400, clamp(1.2rem, 2vw, 1.6rem), 1.1): card titles, drop names.
- **Body** (400, 1rem, 1.7): paragraphs, capped ~70ch.
- **Label** (600–800, 0.55–0.72rem, letter-spacing 0.1–0.3em, UPPERCASE): buttons, tags, status chips.

### Named Rules
**The All-Caps Ceiling Rule.** Uppercase lives in display, headlines, and short labels. Body copy is never uppercase.
**The 0.06em Rule.** Bebas Neue always gets +0.06em tracking; it is never set tight.

## 4. Elevation

Depth is tonal and linear, not shadowed: surfaces step #050505 → #090909 → #0e0e0e with hairline-white borders. Box-shadows exist in two roles only: deep black ambient lift under floating chrome (modals, drawers, mobile tab bar) and **red glow** as a state/identity signal (WhatsApp button, live indicators, charged CTAs). On mobile, all multi-layer shadows flatten to `0 4px 14px rgba(0,0,0,0.5)` for GPU sanity.

### Shadow Vocabulary
- **Ambient lift** (`0 4px 20px–24px rgba(0,0,0,0.5)`): floating chrome above the page.
- **Blood glow** (`0 4px 20px rgba(220,17,17,0.4)` and stronger pulses): red elements announcing liveness.

### Named Rules
**The Glow-Is-Meaning Rule.** Red glow is a signal (live, urgent, actionable), never decoration on static elements.

## 5. Components

### Buttons
- **Shape:** hard-edged, radius 0; primary CTAs carry chamfered clip-path corners.
- **Primary:** Blood Red bg, Bone White uppercase label (0.7–0.85rem, tracking ≥0.15em), padding ~1rem 2.5rem; hover → Blood Bright with subtle scan-line sweep.
- **Ghost:** transparent bg, hairline border, Bone White label; hover fills with rgba-red tint.
- **Focus:** visible outline (red) — never removed.

### Chips / Tags
- **Style:** tiny uppercase Barlow labels (0.55–0.7rem, heavy weight, wide tracking) on Abyss-2/3 with hairline borders; status variants: green = Stock CR, red = Encargo.

### Cards / Containers
- **Corner Style:** 0 radius; signature cards use chamfered clip-path notches.
- **Background:** Abyss 2/3 over Abyss; image-led cards are full-bleed with gradient scrims.
- **Border:** Hairline White at rest; Hairline Red or Blood Red on hover/active.
- **Hover:** image crossfade/zoom, scan-line sweep, red underline draws — transform/opacity only.

### Inputs / Fields
- **Style:** flat Abyss-2 wells, hairline border, radius 0, Ash text; focus → red border shift + subtle glow.

### Navigation
- Fixed navbar over the page, transparent → solid Abyss on scroll (`.scrolled`); uppercase Barlow labels with red hover underline. Mobile: 3-element top bar + slide-in drawer + fixed bottom tab bar (opaque Abyss, red active state).

### Signature Component: the Ticker
Full-width fixed top bar with rotating uppercase micro-messages and a slow background shimmer — the "always live" pulse of the storefront.

## 6. Do's and Don'ts

### Do:
- **Do** keep the page ≥90% neutral (Abyss + Ash + Bone) and spend red like ammunition.
- **Do** cut corners with clip-path chamfers on signature elements (cards, CTAs, badges).
- **Do** ship a `prefers-reduced-motion` alternative for every loop and reveal, no exceptions.
- **Do** judge every change at 375px first — mobile is the storefront.
- **Do** make Stock CR vs Encargo status legible on every product surface (green vs red chips).
- **Do** use the canonical motion scale (--t-instant 0.12s → --t-cinematic 0.8s, --ease-out/--ease-emph) for all new motion.

### Don't:
- **Don't** introduce any hue besides the red family — no purple, cyan, gold, or "premium" gradients (PRODUCT.md: no neon cyberpunk; red is blood, not laser).
- **Don't** use border-radius anywhere; rounded corners are off-brand (chamfer or hard edge).
- **Don't** reach for SaaS grammar: gradient text, metric-card heroes, cream backgrounds, icon-above-heading grids (PRODUCT.md: "no generic SaaS product site").
- **Don't** stack fake-urgency widgets or discount stickers (PRODUCT.md: "no Shopify/dropshipper template look").
- **Don't** use serifs or italic editorial type anywhere (PRODUCT.md: "no editorial-magazine affectation").
- **Don't** animate layout properties (top/left/width/height) in new motion; transform/opacity/clip-path only, and never bounce/elastic easing.
