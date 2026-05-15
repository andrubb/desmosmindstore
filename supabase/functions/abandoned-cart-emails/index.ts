// ════════════════════════════════════════════════════════════
// Abandoned cart reminder — Supabase Edge Function (Deno)
//
// Runs on a cron schedule (e.g. every hour). Finds cart_sessions
// where:
//   • status = 'active'
//   • email is set
//   • item_count > 0
//   • last_active_at older than ABANDON_THRESHOLD_HOURS
//   • reminded_at is null
// Sends an email via Resend, marks the row as 'reminded'.
//
// DEPLOY:
//   supabase functions deploy abandoned-cart-emails --no-verify-jwt
//
// SCHEDULE (in Supabase dashboard → Database → Cron):
//   schedule: '0 * * * *'              -- every hour at :00
//   command:  select net.http_post(
//     url := 'https://<project>.functions.supabase.co/abandoned-cart-emails',
//     headers := jsonb_build_object('Authorization', 'Bearer <ANON_OR_CRON_SECRET>')
//   );
//
// ENV (Supabase Dashboard → Project Settings → Edge Functions → Secrets):
//   RESEND_API_KEY   — required, from resend.com/api-keys
//   FROM_EMAIL       — e.g. "Desmos Mind <hola@desmosmind.com>"
//   SITE_URL         — e.g. "https://desmosmind.netlify.app"
//   ABANDON_THRESHOLD_HOURS — optional, defaults to "1"
// ════════════════════════════════════════════════════════════

// @ts-ignore — Deno runtime
import { createClient } from 'jsr:@supabase/supabase-js@2';

// @ts-ignore — Deno env
const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
// @ts-ignore — Deno env
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// @ts-ignore — Deno env
const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY')!;
// @ts-ignore — Deno env
const FROM_EMAIL                = Deno.env.get('FROM_EMAIL') || 'Desmos Mind <onboarding@resend.dev>';
// @ts-ignore — Deno env
const SITE_URL                  = Deno.env.get('SITE_URL') || 'https://desmosmind.netlify.app';
// @ts-ignore — Deno env
const ABANDON_THRESHOLD_HOURS   = parseInt(Deno.env.get('ABANDON_THRESHOLD_HOURS') || '1', 10);

interface CartItem {
  product_id?: number;
  name?: string;
  brand?: string;
  img?: string;
  size?: string;
  color?: string;
  qty?: number;
  price?: number;
}

interface CartSession {
  id: string;
  client_id: string;
  email: string;
  cart_items: CartItem[];
  cart_total: number;
  item_count: number;
  status: string;
  last_active_at: string;
  reminded_at: string | null;
}

// @ts-ignore — Deno.serve
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    return Response.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const cutoff = new Date(Date.now() - ABANDON_THRESHOLD_HOURS * 60 * 60 * 1000).toISOString();

  const { data: carts, error } = await supabase
    .from('cart_sessions')
    .select('*')
    .eq('status', 'active')
    .lt('last_active_at', cutoff)
    .is('reminded_at', null)
    .not('email', 'is', null)
    .gt('item_count', 0)
    .limit(100);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!carts || carts.length === 0) {
    return Response.json({ processed: 0, message: 'No abandoned carts to remind' });
  }

  const results: Array<{ email: string; status: string; error?: string }> = [];
  for (const cart of carts as CartSession[]) {
    try {
      const html = renderAbandonedEmail(cart);
      const subject = 'Olvidaste algo en Desmos Mind...';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: cart.email,
          subject: subject,
          html: html
        })
      });
      if (res.ok) {
        await supabase
          .from('cart_sessions')
          .update({
            status: 'reminded',
            reminded_at: new Date().toISOString()
          })
          .eq('id', cart.id);
        results.push({ email: cart.email, status: 'sent' });
      } else {
        const txt = await res.text();
        results.push({ email: cart.email, status: 'failed', error: txt });
      }
    } catch (e: any) {
      results.push({ email: cart.email, status: 'failed', error: String(e?.message || e) });
    }
  }

  return Response.json({ processed: results.length, results });
});

// ─────────────────────────────────────────────────────────────
// Email template — dark gothic, inline styles (max email client compat)
// ─────────────────────────────────────────────────────────────
function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function fmtCRC(n: number): string {
  return '₡' + Math.round(n).toLocaleString('es-CR');
}

function renderAbandonedEmail(cart: CartSession): string {
  const items = (cart.cart_items || []).map((i) => {
    const lineTotal = (i.price || 0) * (i.qty || 1);
    return `
      <tr>
        <td style="padding:14px 14px 14px 0;border-bottom:1px solid #1a1a1a;width:64px;">
          <img src="${escapeHtml(i.img || '')}" alt="${escapeHtml(i.name || '')}"
            width="64" height="64"
            style="display:block;background:#0e0e0e;object-fit:cover;border:1px solid #1a1a1a;">
        </td>
        <td style="padding:14px 14px;border-bottom:1px solid #1a1a1a;color:#f0ece4;font-family:'Helvetica Neue',Arial,sans-serif;">
          <div style="color:#DC1111;font-size:10px;letter-spacing:.25em;text-transform:uppercase;font-weight:700;margin-bottom:4px;">${escapeHtml(i.brand || '')}</div>
          <div style="font-size:14px;line-height:1.3;">${escapeHtml(i.name || '')}</div>
          ${i.size  ? `<div style="font-size:11px;color:#8a8a82;margin-top:4px;">Talla: ${escapeHtml(i.size)}</div>` : ''}
          ${i.color ? `<div style="font-size:11px;color:#8a8a82;margin-top:2px;">Color: ${escapeHtml(i.color)}</div>` : ''}
          ${(i.qty || 1) > 1 ? `<div style="font-size:11px;color:#8a8a82;margin-top:2px;">Cantidad: ${i.qty}</div>` : ''}
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #1a1a1a;color:#f0ece4;text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:700;white-space:nowrap;">
          ${fmtCRC(lineTotal)}
        </td>
      </tr>`;
  }).join('');

  return `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8">
<meta name="color-scheme" content="dark">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tu drop te espera — Desmos Mind</title>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;color:#f0ece4;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:0;line-height:0;color:#050505;">Dejaste piezas en tu carrito. Tu drop te espera.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#050505;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#0a0a0a;border:1px solid #1a1a1a;">

        <!-- Header -->
        <tr><td style="padding:36px 32px;text-align:center;border-bottom:1px solid #DC1111;">
          <div style="color:#DC1111;font-size:10px;letter-spacing:.4em;text-transform:uppercase;font-weight:700;margin-bottom:10px;">Tu drop te espera</div>
          <div style="font-size:36px;letter-spacing:.06em;color:#f0ece4;font-weight:900;line-height:1;">
            DESMOS<span style="color:#DC1111;">MIND</span>
          </div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 22px;font-size:15px;line-height:1.55;color:#d4d0c8;">
            Dejaste piezas en tu carrito. Las apartamos por ahora — pero no por mucho.
            Importamos en cantidades limitadas y se mueven rápido.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            ${items}
            <tr>
              <td colspan="2" style="padding:18px 0 0;color:#8a8a82;font-size:11px;letter-spacing:.22em;text-transform:uppercase;font-weight:700;">Total</td>
              <td style="padding:18px 0 0;text-align:right;color:#f0ece4;font-size:22px;font-weight:900;letter-spacing:.04em;">${fmtCRC(cart.cart_total || 0)}</td>
            </tr>
          </table>

          <!-- CTA -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:32px;">
            <tr><td align="center">
              <a href="${SITE_URL}"
                 style="display:inline-block;background:#DC1111;color:#ffffff;text-decoration:none;padding:18px 40px;font-size:13px;letter-spacing:.22em;text-transform:uppercase;font-weight:700;border:1px solid #DC1111;">
                Completar mi pedido →
              </a>
            </td></tr>
          </table>

          <p style="margin:28px 0 0;font-size:12px;color:#6a6a62;line-height:1.6;text-align:center;">
            ¿Preguntas? Respondé este correo o escribinos al WhatsApp.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid #1a1a1a;text-align:center;font-size:10px;color:#6a6a62;line-height:1.6;letter-spacing:.04em;">
          Recibís este correo porque guardaste tu email en Desmos Mind para que te avisemos de drops y carritos abandonados.<br>
          <a href="${SITE_URL}/privacy.html" style="color:#DC1111;text-decoration:underline;">Política de Privacidad</a>
          &nbsp;·&nbsp;
          <a href="${SITE_URL}/terms.html" style="color:#DC1111;text-decoration:underline;">Términos</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}
