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
  amount integer not null,
  currency text not null default 'HKD',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  name text not null,
  contact text not null,
  language text not null,
  document_type text not null,
  words integer not null,
  units integer not null,
  quote integer not null,
  currency text not null default 'HKD',
  deadline date,
  notes text not null default '',
  status text not null default 'new'
    check (status in ('new', 'quoted', 'confirmed', 'in_progress', 'delivered', 'cancelled')),
  source text not null default 'naturalizer-site',
  created_at timestamptz not null default now()
);

create index if not exists quotes_created_at_idx
  on public.quotes (created_at desc);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_status_idx
  on public.orders (status);

-- No policies are added: public keys cannot read or write these tables.
-- The server-only service role used by /api and /ops bypasses RLS.
alter table public.quotes enable row level security;
alter table public.orders enable row level security;
