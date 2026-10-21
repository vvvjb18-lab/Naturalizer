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

- Under 600 words: **HK$65**
- From 600 words: **HK$85 per 600-word unit**
- Payment: **Alipay HK**
- Every revised draft includes a post-revision **Turnitin AI report**

The calculator rounds up to the next 600-word unit. The final quote is confirmed after reviewing the draft and turnaround. The [Carousell listing](https://www.carousell.com.hk/p/naturalizer-%E6%B8%9B%E4%BD%8Eai%E6%AA%A2%E6%B8%AC%E7%8E%87-%E9%99%8D%E4%BD%8Eai%E7%8E%87-%E5%8E%BBai-%E4%BA%BA%E9%A1%9E%E5%8C%96-%E8%87%AA%E7%84%B6%E5%8C%96-%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E%E5%AD%B8%E8%A1%93%E8%AB%96%E6%96%87%E6%9C%8D%E5%8B%99-1469557127/) remains available as an alternative contact channel.

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
- words, billable units, unit price, minimum price, and final estimate
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
  "units": 1,
  "quote": 85,
  "currency": "HKD",
  "deadline": "2026-10-30",
  "notes": "Keep the methodology terminology.",
  "source": "naturalizer-site"
}
```

Orders are not stored by the site itself. Configure the webhook destination to persist or route them. The endpoint does not accept payments; payment is confirmed manually by Alipay HK after the draft and turnaround are agreed.

## Bilingual and theme behaviour

- Content lives in [`lib/i18n.ts`](lib/i18n.ts). Both languages share the same shape, so adding a field requires updating both locales.
- The locale and theme are stored in `localStorage` under `naturalizer-locale` and `naturalizer-theme`.
- An inline script in `app/layout.tsx` applies the saved theme before paint. The React provider syncs the control state after mount.
- The default language is Traditional Chinese. The HTML `lang` attribute updates when the visitor switches language.

## Project structure

```text
app/
  api/orders/route.ts  Order validation and optional webhook forwarding
  api/quote/route.ts   Structured quote IDs and optional quote archiving
  layout.tsx           Metadata, theme bootstrap, global chrome
  page.tsx             Landing-page composition
  terms/page.tsx       Terms of service route
  privacy/page.tsx     Privacy policy route
  globals.css          Shadcn tokens, light and dark themes
  icon.svg             Favicon
components/
  providers.tsx        Language and theme context
  site-controls.tsx    Language and theme buttons
  site-header.tsx      Sticky navigation and CTA
  hero.tsx             Hero, sample revision, price entry point
  features.tsx         Service pillars
  how-it-works.tsx     Three-step order process
  trust.tsx            About and service commitments
  why-direct.tsx       Website vs Carousell comparison
  pricing.tsx          Three word-count price points
  order-form.tsx       Quote calculator, order form, success state
  legal-page.tsx       Bilingual legal document layout
  faq.tsx              Accordion FAQ
  cta.tsx              Closing call to action
  site-footer.tsx      Footer, Carousell links, disclaimer
  ui/                  Button, card, badge, input, textarea, accordion
lib/
  i18n.ts              Chinese and English copy
  pricing.ts           Shared quote calculation and HKD formatting
  site.ts              Carousell URLs and seller handle
  legal.ts             Terms and privacy copy in both languages
  utils.ts             cn() class merge helper
```

## Deploy to Vercel

```bash
git init
git add .
git commit -m "Build Naturalizer order site"
gh repo create naturalizer --public --source=. --remote=origin --push
```

Then import the repository at [vercel.com/new](https://vercel.com/new). Next.js is detected automatically. Add `ORDER_WEBHOOK_URL` and/or `QUOTE_WEBHOOK_URL` if automated delivery or quote archiving is required. No other environment variables are needed.

## Service boundaries

This is an editing service, not a ghostwriting service. The site states that it cannot guarantee any AI detector result. Turnitin is a third-party trademark. Carousell remains an alternative contact channel; final pricing and availability are confirmed when an order is accepted.

The terms and privacy text in `lib/legal.ts` is a practical starting point, not legal advice. Have a Hong Kong solicitor review it before launch, and update it whenever the workflow, payment method, data retention, or subcontractors change.

## Dependency note

The project keeps Next.js 14.2.35 as requested. Next.js 14 is past its upstream support window, and `npm audit` reports advisories that are fixed only in newer major versions. For a long-lived public deployment, plan an upgrade to a supported Next.js release and retest the order route.
