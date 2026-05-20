// ════════════════════════════════════════════════════════════
// Desmos Mind — Deferred effects bundle
// Lazy-loaded after first user interaction OR ~3s idle.
// Contains visual flourishes that don't affect critical-path UX:
//   • Add-to-cart confetti (first-add-per-session)
// More effects can join this bundle later (e.g., extra particle
// systems, decorative scroll animations) without bloating the
// initial HTML.
//
// All functions are exposed on `window` so inline handlers in the
// main script keep working unchanged.
// ════════════════════════════════════════════════════════════
(function(){
  'use strict';

  // ─── Add-to-cart confetti ───
  const CONFETTI_SESSION_KEY = 'desmos_confetti_fired';
  function fireCartConfetti(){
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      if (sessionStorage.getItem(CONFETTI_SESSION_KEY)) return;
      sessionStorage.setItem(CONFETTI_SESSION_KEY, '1');
    } catch(e) { /* fire every time if storage blocked */ }

    const btn = document.getElementById('cart-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;

    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const COLORS = ['#DC1111', '#ff2222', '#a50d0d', '#f0ece4', '#ff5555'];
    const SHAPES = ['square', 'circle', 'streak'];
    const COUNT  = 32;

    for (let i = 0; i < COUNT; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece ' + SHAPES[i % SHAPES.length];
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25;
      const power = 220 + Math.random() * 280;
      const dx = Math.cos(angle) * power;
      const dy = Math.sin(angle) * power;
      const rot  = (Math.random() - 0.5) * 900;
      const size = 5 + Math.random() * 5;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const dur   = 950 + Math.random() * 700;

      piece.style.setProperty('--cx', cx + 'px');
      piece.style.setProperty('--cy', cy + 'px');
      piece.style.setProperty('--dx', dx.toFixed(1) + 'px');
      piece.style.setProperty('--dy', dy.toFixed(1) + 'px');
      piece.style.setProperty('--rot', rot.toFixed(0) + 'deg');
      piece.style.setProperty('--size', size.toFixed(1) + 'px');
      piece.style.background = color;
      piece.style.color = color; // box-shadow uses currentColor
      piece.style.animationDuration = dur + 'ms';
      piece.style.animationDelay = (Math.random() * 80) + 'ms';
      container.appendChild(piece);
    }
    setTimeout(() => container.remove(), 2200);
  }

  // Expose
  window.fireCartConfetti = fireCartConfetti;
})();
