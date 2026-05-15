# Supabase backend — Desmos Mind

This folder contains the database schema and Edge Functions that power the
storefront's server-side features:

| File | Purpose |
|---|---|
| `schema.sql` | DDL for products columns (stock, flags), orders table, cart_sessions table, RLS policies |
| `functions/abandoned-cart-emails/index.ts` | Deno Edge Function — cron-triggered abandoned cart reminder via Resend |

---

## 1. Apply the schema

Open the Supabase Dashboard → SQL Editor → paste `schema.sql` → Run.

This adds:

- `stock`, `is_new`, `bestseller` columns to `products`
- Enables Postgres realtime on `products` (so the storefront can subscribe to live stock updates)
- `orders` table with anon insert/read policies
- `cart_sessions` table for abandoned cart tracking

---

## 2. Deploy the abandoned-cart Edge Function

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- A [Resend](https://resend.com) account + API key
- A verified sending domain in Resend (or use `onboarding@resend.dev` for testing)

### Set the function secrets

```bash
supabase secrets set \
  RESEND_API_KEY=re_xxxxxxxx \
  FROM_EMAIL="Desmos Mind <hola@desmosmind.com>" \
  SITE_URL="https://desmosmind.netlify.app" \
  ABANDON_THRESHOLD_HOURS=1
```

### Deploy

```bash
supabase functions deploy abandoned-cart-emails --no-verify-jwt
```

`--no-verify-jwt` allows the cron scheduler to invoke without a user JWT.
The function still requires the Supabase service-role key (loaded from the
secrets above) for database access.

### Test manually

```bash
curl -X POST https://<PROJECT_REF>.functions.supabase.co/abandoned-cart-emails
```

You should get a JSON response like:

```json
{ "processed": 0, "message": "No abandoned carts to remind" }
```

---

## 3. Schedule the cron job

In the Supabase Dashboard → **Database → Extensions**, enable `pg_cron` and `pg_net`.

Then in the SQL Editor, run:

```sql
select cron.schedule(
  'abandoned-cart-emails',
  '0 * * * *',          -- every hour at :00
  $$
    select net.http_post(
      url := 'https://<PROJECT_REF>.functions.supabase.co/abandoned-cart-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer <YOUR_ANON_KEY>'
      ),
      body := '{}'::jsonb
    );
  $$
);
```

Replace `<PROJECT_REF>` with your Supabase project reference (the subdomain) and
`<YOUR_ANON_KEY>` with the anon public key (since the function was deployed
with `--no-verify-jwt`, any key passes; using the anon key is fine).

To pause/remove the cron:

```sql
select cron.unschedule('abandoned-cart-emails');
```

---

## 4. Verify

After a user adds items to cart + provides email + leaves the site for >1h:

```sql
select * from cart_sessions
where status = 'reminded'
order by reminded_at desc
limit 10;
```

You should see rows with `reminded_at` populated. Check the Resend dashboard
to confirm delivery.
