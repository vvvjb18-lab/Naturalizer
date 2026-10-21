# Naturalizer

A minimalist landing page for an academic writing service. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI primitives, and Lucide icons.

The trial editor is intentionally front-end only: submitting a paragraph starts a short simulated review and shows a success state. There is no API, database, authentication, or external request.

## Requirements

- Node.js 18.17 or later (Node 20 LTS recommended)
- npm 9 or later

## Run locally

```bash
cd naturalizer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run typecheck   # TypeScript strict-mode check
npm run build       # Production build
npm run start       # Serve the production build
```

## Create the same project from scratch

```bash
npx create-next-app@14.2.35 naturalizer \
  --typescript --tailwind --app --no-src-dir --import-alias "@/*"

cd naturalizer

npm install lucide-react class-variance-authority clsx tailwind-merge \
  @radix-ui/react-accordion @radix-ui/react-slot

npm install -D tailwindcss-animate
```

The Shadcn/UI primitives used here are checked into `components/ui`, so no generator step is required. To add more primitives later, use `npx shadcn@latest add <component>` and keep the existing Tailwind 3 / CSS-variable setup.

## Structure

```text
app/
  layout.tsx           Global metadata, header, footer, system font stack
  page.tsx             Landing-page section order
  globals.css          Shadcn tokens and base styles
  icon.svg             Browser icon
components/
  site-header.tsx      Sticky navigation
  hero.tsx             Hero and before/after preview
  features.tsx         Four capability cards
  how-it-works.tsx     Three-step explainer
  try-demo.tsx         Client-only simulated trial form
  testimonials.tsx     Three student quotes
  pricing.tsx          Three plans with a highlighted middle tier
  faq.tsx              Radix accordion FAQ
  cta.tsx              Closing call to action
  site-footer.tsx      Minimal footer
  section-heading.tsx  Shared section intro
  ui/                  Button, card, badge, input, textarea, accordion
lib/
  utils.ts             cn() class merge helper
```

Only `try-demo.tsx` and the Radix accordion primitive use client-side JavaScript. Every other page component is a Server Component.

## Content and design

- White / `#F9FAFB` surfaces, `#111827` body text, one `#2563EB` accent, `#E5E7EB` borders.
- System UI font stack with no webfont request.
- Mobile-first spacing and layouts, verified down to 320px viewport width.
- All page copy lives beside its component, so content edits do not require touching layout code.

## Deploy to Vercel

### Push to GitHub

```bash
git init
git add .
git commit -m "Build Naturalizer landing page"

# With GitHub CLI authenticated:
gh repo create naturalizer --public --source=. --remote=origin --push
```

Without the GitHub CLI, create an empty repository on github.com, then:

```bash
git remote add origin https://github.com/<your-user>/naturalizer.git
git branch -M main
git push -u origin main
```

### Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
2. Vercel detects Next.js automatically. Keep the default build command (`next build`) and output settings.
3. No environment variables are needed. Click **Deploy**.

Or deploy from the terminal:

```bash
npx vercel --prod
```

Every push to `main` will create a new production deployment.

## Dependency note

This project uses Next.js 14.2.35 as requested. Next.js 14 is past its upstream support window, and `npm audit` reports advisories that are only fixed in newer major versions. For a long-lived public deployment, plan an upgrade to a currently supported Next.js release and retest the App Router setup.
