# Naturalizer

Bilingual (Traditional Chinese / English) landing page and order intake for a human-reviewed academic editing service in Hong Kong.

The site is built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI primitives, and Lucide icons. It includes:

- Chinese / English switching with persisted preference
- Light / dark theme with no-flash initialisation
- Instant word-count quote calculator
- Structured order form with client-side validation
- Optional webhook delivery for automated order handling
- Carousell listing and seller links as a fallback channel
- Bilingual terms of service and privacy policy

## Pricing

Published website pricing:

- First 600 words: **HK$85**
- Words 601–1,200: **HK$0.08 per extra word**
- Words 1,201–1,800: **HK$0.07 per extra word**
- Words 1,801 and above: **HK$0.06 per extra word**
- Rush turnaround: **90 minutes +HK$0**, **60 minutes +HK$30**, **30 minutes +HK$60**
- The 30-minute option is limited to **600 words or fewer**; longer drafts require manual intake.
- Payment: **Alipay HK**
- Every revised draft includes a post-revision **Turnitin AI report**

The calculator applies the tiered rates progressively to words above 600. The final quote is confirmed after reviewing the draft and turnaround. The [Carousell listing](https://www.carousell.com.hk/p/naturalizer-%E6%B8%9B%E4%BD%8Eai%E6%AA%A2%E6%B8%AC%E7%8E%87-%E9%99%8D%E4%BD%8Eai%E7%8E%87-%E5%8E%BBai-%E4%BA%BA%E9%A1%9E%E5%8C%96-%E8%87%AA%E7%84%B6%E5%8C%96-%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E%E5%AD%B8%E8%A1%93%E8%AB%96%E6%96%87%E6%9C%8D%E5%8B%99-1469557127/) remains available as an alternative contact channel.

The website also states the four service rules: the clock starts only after payment is confirmed, the file opens, and requirements are confirmed; 30-minute work is limited to 600 words; late rush work refunds the full rush fee (or the next rush fee is waived for a late 90-minute standard order); and no grade or AI-detection result is guaranteed.

## Run locally

```bash
cd naturalizer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run typecheck   # TypeScript strict check
npm run build       # Production build
npm run start       # Serve the production build
```

## Quote generation

The order calculator calls `POST /api/quote` after a short debounce. The endpoint returns a structured quote with:

- a `quoteId` and 14-day expiry
- words, base amount, rush fee, turnaround, and final estimate
- language and document type

The browser keeps the latest 10 quotes in `localStorage` under `naturalizer-quotes` and includes the quote ID in the copyable summary. If `QUOTE_WEBHOOK_URL` is configured, the quote is also sent to that endpoint as a `quote.created` event. Vercel functions cannot persist quotes to a local file, so no fake server-side storage is used when the webhook is absent.

## Order automation

The form posts to `POST /api/orders`. The server validates the payload, calculates the quote again, and then:

- If `ORDER_WEBHOOK_URL` is set, forwards the order as JSON to that URL.
- If it is not set, returns an order summary in `handoff` mode and the UI directs the customer to send the order number and draft through Carousell.

For local development, create `.env.local`:

```bash
ORDER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook-id/
QUOTE_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-quote-webhook-id/
```

The same variables can be added in Vercel under **Project Settings → Environment Variables**. They work with Zapier, Make, or any endpoint that accepts JSON.

Example payload:

```json
{
  "orderId": "NAT-261022-A1B2",
  "createdAt": "2026-10-22T12:00:00.000Z",
  "name": "Student",
  "contact": "student@example.com",
  "language": "bilingual",
  "documentType": "essay",
  "words": 600,
  "baseAmount": 85,
  "rushFee": 30,
  "rush": "priority",
  "rushMinutes": 60,
  "quote": 115,
  "currency": "HKD",
  "deadline": "2026-10-30",
  "notes": "Keep the methodology terminology.",
  "source": "naturalizer-site"
}
```

Orders are stored in Supabase when it is configured; local development uses `.data/admin.json`. Webhook forwarding is optional. The endpoint does not accept payments; payment is confirmed manually by Alipay HK after the draft and turnaround are agreed.

## Admin dashboard

The private dashboard lives at `/ops`. It is not linked from the public site, is excluded from robots crawling, and requires a signed HTTP-only session.

Features in the first version:

- Orders list with search, status filtering, customer, word count, quote, and date
- Quotes list with quote ID, language, document type, amount, and expiry
- Order detail view with notes, contact details, and status history
- Status updates: new, quoted, confirmed, in progress, delivered, cancelled
- Status events record the acting admin and timestamp
- CSV export of all orders for records and bookkeeping
- Local development storage in `.data/admin.json` (gitignored)
- Supabase storage in production
- Individual admin accounts managed through `ADMIN_USERS`
- A 12-hour signed session and the acting admin recorded on status changes
- Basic security headers and `/ops` noindex rules

Configure `ADMIN_USERS` and a random `ADMIN_SESSION_SECRET` of at least 32 characters in `.env.local`. Each account has an id, display name, username, role, and scrypt password hash. Generate a hash with:

```bash
npm run admin:hash -- "a-strong-password"
```

Example (use one JSON line in Vercel):

```bash
ADMIN_USERS=[{"id":"owner","name":"Owner","username":"owner","role":"owner","passwordHash":"scrypt:..."}]
```

The local bootstrap credentials are stored in `.admin-accounts.local.txt`, which is gitignored. This is only a starting point; rotate the passwords and replace the hashes when the account holders choose their own. There is no shared-password fallback.

For production persistence, create a Supabase project, run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor, and set:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` must remain server-only. Never prefix it with `NEXT_PUBLIC_`. The public application uses server routes to write orders and quotes; the browser never receives the service role key or reads the tables directly.

The schema is idempotent for tables and indexes, and includes `alter table ... add column if not exists` plus the `order_events` table. Re-run it after upgrading an existing database so the audit timeline works.

This first version deliberately does not include file uploads, fine-grained role permissions, or password reset. Those should be added after the storage and workflow are validated. Account changes are made through `ADMIN_USERS` and a redeploy.

## Bilingual and theme behaviour

- Content lives in [`lib/i18n.ts`](lib/i18n.ts). Both languages share the same shape, so adding a field requires updating both locales.
- The locale and theme are stored in `localStorage` under `naturalizer-locale` and `naturalizer-theme`.
- An inline script in `app/layout.tsx` applies the saved theme before paint. The React provider syncs the control state after mount.
- The default language is Traditional Chinese. The HTML `lang` attribute updates when the visitor switches language.

## Project structure

```text
app/
  (site)/              Public site layout and pages
    layout.tsx         Public header, footer, skip link
    page.tsx           Landing-page composition
    terms/page.tsx     Terms of service route
    privacy/page.tsx   Privacy policy route
  api/orders/route.ts  Order validation, storage, optional webhook forwarding
  api/quote/route.ts   Structured quote IDs, storage, optional quote webhook
  ops/                 Private admin route group
    login/             Password login and server action
    (dashboard)/       Authenticated dashboard, orders, quotes
  layout.tsx           Metadata and theme bootstrap
  globals.css          Shadcn tokens, light and dark themes
  icon.svg             Favicon
  robots.ts            Disallow /ops and /api from crawlers
components/
  providers.tsx        Language and theme context
  site-controls.tsx    Language and theme buttons
  site-header.tsx      Sticky navigation and CTA
  hero.tsx             Hero, sample revision, price entry point
  features.tsx         Service pillars
  how-it-works.tsx     Three-step order process
  trust.tsx            About and service commitments
  why-direct.tsx       Website vs Carousell comparison
  pricing.tsx          Tiered word-count pricing table and examples
  order-form.tsx       Quote calculator, order form, success state
  legal-page.tsx       Bilingual legal document layout
  faq.tsx              Accordion FAQ
  cta.tsx              Closing call to action
  site-footer.tsx      Footer, Carousell links, disclaimer
  admin/
    storage-notice.tsx Configuration notice for missing storage
  ui/                  Button, card, badge, input, textarea, accordion
lib/
  i18n.ts              Chinese and English copy
  pricing.ts           Shared quote calculation and HKD formatting
  site.ts              Carousell URLs and seller handle
  legal.ts             Terms and privacy copy in both languages
  admin/session.ts     Admin password verification and signed session
  admin/store.ts       Local JSON / Supabase persistence layer
  admin/labels.ts      Status labels and date/amount formatting
  utils.ts             cn() class merge helper
supabase/
  schema.sql           Tables, indexes, and RLS for the admin data
scripts/
  hash-admin-password.mjs  Generate scrypt hashes for ADMIN_USERS
```

## Deploy to Vercel

```bash
git init
git add .
git commit -m "Build Naturalizer order site"
gh repo create naturalizer --public --source=. --remote=origin --push
```

Then import the repository at [vercel.com/new](https://vercel.com/new). Next.js is detected automatically.

Add these environment variables in Vercel:

```bash
ADMIN_USERS=[{"id":"owner","name":"Owner","username":"owner","role":"owner","passwordHash":"scrypt:..."}]
ADMIN_SESSION_SECRET=a-random-string-of-at-least-32-characters
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional automation
ORDER_WEBHOOK_URL=
QUOTE_WEBHOOK_URL=
```

Run `supabase/schema.sql` in the Supabase SQL editor before using `/ops` in production.

## Service boundaries

This is an editing service, not a ghostwriting service. The site states that it cannot guarantee any AI detector result. Turnitin is a third-party trademark. Carousell remains an alternative contact channel; final pricing and availability are confirmed when an order is accepted.

The terms and privacy text in `lib/legal.ts` is a practical starting point, not legal advice. Have a Hong Kong solicitor review it before launch, and update it whenever the workflow, payment method, data retention, or subcontractors change.

## Dependency note

The project keeps Next.js 14.2.35 as requested. Next.js 14 is past its upstream support window, and `npm audit` reports advisories that are fixed only in newer major versions. For a long-lived public deployment, plan an upgrade to a supported Next.js release and retest the order route.
