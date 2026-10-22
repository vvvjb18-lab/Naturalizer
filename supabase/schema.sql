-- Run this in the Supabase SQL editor before enabling the /ops dashboard
-- in production. The application talks to these tables with the service
-- role key from a server route only. Do not expose that key to the browser.

create extension if not exists pgcrypto;

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_id text not null unique,
  language text not null,
  document_type text not null,
  words integer not null,
  units integer not null,
  base_amount numeric(10, 2) not null default 0,
  rush_fee numeric(10, 2) not null default 0,
  rush_tier text not null default 'standard',
  turnaround_minutes integer not null default 90,
  amount numeric(10, 2) not null,
  currency text not null default 'HKD',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  tracking_code text unique,
  name text not null,
  contact text not null default '',
  referral_source text not null default '',
  language text not null,
  document_type text not null,
  words integer not null,
  units integer not null,
  base_amount numeric(10, 2) not null default 0,
  rush_fee numeric(10, 2) not null default 0,
  rush_tier text not null default 'standard',
  turnaround_minutes integer not null default 90,
  quote numeric(10, 2) not null,
  currency text not null default 'HKD',
  deadline date,
  notes text not null default '',
  status text not null default 'new'
    check (status in ('new', 'quoted', 'confirmed', 'in_progress', 'delivered', 'cancelled')),
  source text not null default 'naturalizer-site',
  updated_by text,
  updated_at timestamptz,
  created_at timestamptz not null default now()
);

-- Add audit columns when upgrading an existing database created before
-- two-person admin support was added.
alter table public.orders add column if not exists updated_by text;
alter table public.orders add column if not exists updated_at timestamptz;
alter table public.orders add column if not exists referral_source text not null default '';
alter table public.orders add column if not exists tracking_code text;
alter table public.orders alter column contact set default '';

create unique index if not exists orders_tracking_code_idx
  on public.orders (tracking_code)
  where tracking_code is not null;

-- Upgrade pricing columns for tiered pricing and rush fees. Existing rows
-- keep their original total in amount/quote and use it as the base amount.
alter table public.quotes
  alter column amount type numeric(10, 2) using amount::numeric(10, 2);
alter table public.orders
  alter column quote type numeric(10, 2) using quote::numeric(10, 2);

alter table public.quotes add column if not exists base_amount numeric(10, 2);
alter table public.quotes add column if not exists rush_fee numeric(10, 2) not null default 0;
alter table public.quotes add column if not exists rush_tier text not null default 'standard';
alter table public.quotes add column if not exists turnaround_minutes integer not null default 90;

alter table public.orders add column if not exists base_amount numeric(10, 2);
alter table public.orders add column if not exists rush_fee numeric(10, 2) not null default 0;
alter table public.orders add column if not exists rush_tier text not null default 'standard';
alter table public.orders add column if not exists turnaround_minutes integer not null default 90;

update public.quotes set base_amount = amount where base_amount is null;
update public.orders set base_amount = quote where base_amount is null;

alter table public.quotes alter column base_amount set default 0;
alter table public.orders alter column base_amount set default 0;

create index if not exists quotes_created_at_idx
  on public.quotes (created_at desc);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_status_idx
  on public.orders (status);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor text not null,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_id_idx
  on public.order_events (order_id, created_at desc);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  admin_id text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_created_at_idx
  on public.push_subscriptions (created_at desc);

-- No policies are added: public keys cannot read or write these tables.
-- The server-only service role used by /api and /ops bypasses RLS.
alter table public.quotes enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;
alter table public.push_subscriptions enable row level security;
