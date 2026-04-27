# Desmos Mind Store

> Gothic streetwear & fitness apparel e-commerce — Costa Rica.

🔗 **Live demo:** [desmosmind.netlify.app](https://desmosmind.netlify.app)

---

## About

Desmos Mind is a Costa Rican streetwear and gym apparel brand built around a bat motif and an aggressive-but-clean dark aesthetic. The store imports premium U.S. labels — Gymshark, YoungLA, Darc Sport, Ryderwear, Breath The Divinity — for sale in Costa Rica, with shipping handled through Correos de Costa Rica and checkout completed over WhatsApp Business.

This repository contains the storefront: a single-page application that serves both as the customer-facing catalog and as the admin tool the brand uses to manage inventory, drops, categories and customer reviews. It is built as a single self-contained `index.html` to keep deployment friction at zero — drop it on any static host and it works.

The audience is gym-culture buyers in their late teens to mid-thirties who care about fit, brand provenance, and presence. The visual language draws from Gymshark's clean modernity, YoungLA's street energy, and Breath The Divinity's darker boldness, combined into one coherent identity.

---

## Features

- **Product catalog** with two-level filtering (categories + subcategories), live counts, hover-swap product cards, and a quick-view modal with image gallery.
- **Persistent cart** with size/color selection, quantity controls, and WhatsApp checkout — the order is composed into a pre-filled message with line items, totals, and delivery preferences.
- **Admin panel** (password-gated) with full CRUD for products, drops, reviews, categories, and editable site copy. Bulk product import via pipe-delimited paste.
- **Offline-first persistence**: products and metadata in `localStorage`, product images as Blobs in `IndexedDB`, optional cloud sync via Supabase. JSON backup/restore for portability across devices.
- **Category visibility toggle** so unfinished verticals (e.g. supplements, accessories) can be hidden from customers without losing the data.
- **Responsive, mobile-first** design with fluid type scaling, reveal-on-scroll animations, and a dark/red palette built around the brand bat motif.
- **Security**: SHA-256 hashed admin password (no plaintext), session persistence via `sessionStorage`, manual lock from the admin panel.

---

## Tech stack

- **HTML5** + **CSS3** (custom design system, 8pt grid, fluid `clamp()` typography)
- **JavaScript** (vanilla ES2020+, no framework, no build step)
- **Supabase** (PostgreSQL + Storage) for optional cloud sync
- **IndexedDB** + **localStorage** for offline-first storage
- **Web Crypto API** for password hashing
- **Netlify** for static hosting and deploys
- **WhatsApp Business** for checkout

---

## Screenshots

<!-- TODO: agregar 3 capturas: home, producto, admin -->

| Home | Product modal | Admin panel |
|---|---|---|
| _coming soon_ | _coming soon_ | _coming soon_ |

---

## Project structure

```
desmosmindstore/
├── index.html          # Single-file SPA (markup + styles + scripts)
├── assets/             # Brand imagery referenced from the app
├── .gitignore
├── LICENSE
└── README.md
```

The whole storefront ships as one `index.html` by design — no bundler, no `npm install`, no environment to configure for the static portion. The Supabase integration is read from constants at the top of the script block and is optional.

---

## Local development

```bash
# Clone
git clone https://github.com/andrubb/desmosmindstore.git
cd desmosmindstore

# Serve locally — any static server works. Example with Python:
python3 -m http.server 8000

# Or with Node:
npx serve .
```

Then open `http://localhost:8000` in a browser.

To access the admin panel, click the small admin trigger and enter the password. Change the password by replacing the `ADMIN_PASS_HASH` constant with the SHA-256 of your new value:

```bash
echo -n 'YourNewPassword' | sha256sum
```

---

## Deployment

The site is deployed on Netlify. Any push to `main` triggers a redeploy. For other static hosts (Cloudflare Pages, Vercel, GitHub Pages), the build command is empty and the publish directory is the repo root.

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Author

**Andrew Jiménez Marín**
Software Developer · Costa Rica

- 🌐 Portfolio: _coming soon_
- 💼 LinkedIn: _coming soon_
- ✉️ Email: _coming soon_
