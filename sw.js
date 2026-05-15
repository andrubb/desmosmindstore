// ════════════════════════════════════════════════════════════
// Desmos Mind — Service Worker
// Strategy:
//   • HTML / navigation:  network-first → cache fallback → offline page
//   • Static (CSS/JS/SVG/PNG): cache-first → network update in background
//   • Supabase API / Plausible / fonts: bypass (always network)
// Bump CACHE_VERSION whenever you ship a breaking change.
// ════════════════════════════════════════════════════════════
const CACHE_VERSION = 'desmos-v3';
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const STATIC_CACHE  = `${CACHE_VERSION}-static`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/Desmos.svg'
];

// Network bypass — never serve these from cache
const BYPASS_HOSTS = [
  'supabase.co',
  'plausible.io',
  'fonts.googleapis.com',   // CSS file — let browser handle
  'wa.me',
  'api.resend.com'
];

// ─── Install: pre-cache static shell ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((e) => console.warn('[SW] install precache failed:', e))
  );
});

// ─── Activate: purge old caches ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: route per request type ───
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Skip non-GET (POST orders, etc.)
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Bypass external APIs we never want stale
  if (BYPASS_HOSTS.some((h) => url.hostname.includes(h))) return;

  // HTML / navigation: network-first
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Same-origin static assets: cache-first with background refresh
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Cross-origin fonts: stale-while-revalidate (fonts.gstatic.com etc.)
  if (url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Images on Unsplash / Supabase Storage: cache-first
  if (url.hostname.includes('images.unsplash.com')) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Default: just let the network handle it
});

// ─── Strategy implementations ───
async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (e) {
    const cached = await caches.match(req);
    return cached || caches.match('/') || new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) {
    // Refresh in background
    fetch(req).then((fresh) => {
      if (fresh && fresh.ok) {
        caches.open(RUNTIME_CACHE).then((c) => c.put(req, fresh));
      }
    }).catch(() => {});
    return cached;
  }
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (e) {
    return new Response('', { status: 504 });
  }
}

async function staleWhileRevalidate(req) {
  const cached = await caches.match(req);
  const fetchPromise = fetch(req).then((fresh) => {
    if (fresh && fresh.ok) {
      caches.open(RUNTIME_CACHE).then((c) => c.put(req, fresh.clone()));
    }
    return fresh;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// ─── Message channel — receive 'SKIP_WAITING' from the page ───
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
