-- ============================================================
-- SJ Vendor Match — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Vendors ─────────────────────────────────────────────────────────────────
create table if not exists vendors (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  category            text not null,
  subcategories       text[]   default '{}',
  home_zip            text     not null,
  radius              integer  not null default 20,
  emoji               text,
  tags                text[]   default '{}',
  price               text,
  description         text,
  insurance           boolean  not null default false,
  has_min_purchase    boolean  not null default false,
  min_purchase_amt    numeric  not null default 0,
  charges_private_fee boolean  not null default false,
  private_event_fee   numeric  not null default 0,
  contact_name        text,
  contact_email       text,
  contact_phone       text,
  website             text,
  instagram           text,
  created_at          timestamptz not null default now()
);

-- Index for fast geo/category lookups
create index if not exists vendors_category_idx on vendors (category);
create index if not exists vendors_home_zip_idx  on vendors (home_zip);

-- Row-level security
alter table vendors enable row level security;

-- Anyone can read vendors; only authenticated users can insert/update their own
create policy "Public read vendors"
  on vendors for select using (true);

create policy "Anon insert vendors"
  on vendors for insert
  with check (true);

create policy "Anon update vendors"
  on vendors for update
  using (true);

-- ─── Events / Opportunities ──────────────────────────────────────────────────
create table if not exists events (
  id                uuid primary key default gen_random_uuid(),
  event_name        text    not null,
  event_type        text    not null,
  zip               text    not null,
  date              date    not null,
  start_time        time,
  end_time          time,
  booth_fee         text,
  spots             integer,
  categories_needed text[]  default '{}',
  contact_name      text,
  contact_email     text,
  contact_phone     text,
  fb_link           text,
  deadline          date,
  notes             text,
  source            text    default 'Host Submitted',
  created_at        timestamptz not null default now()
);

-- Index for date-range and location queries
create index if not exists events_date_idx on events (date);
create index if not exists events_zip_idx  on events (zip);

-- Row-level security
alter table events enable row level security;

create policy "Public read events"
  on events for select using (true);

create policy "Anon insert events"
  on events for insert
  with check (true);

create policy "Anon update events"
  on events for update
  using (true);

-- ─── Vendors: extra fields ────────────────────────────────────────────────────
-- Run these ALTER TABLE statements if the columns don't exist yet
alter table vendors add column if not exists contact_name text;
alter table vendors add column if not exists metadata     jsonb default '{}';

-- ─── Vendors: approval status ────────────────────────────────────────────────
-- 'pending' = awaiting admin review, 'approved' = live on site, 'rejected' = hidden
alter table vendors add column if not exists status text not null default 'pending';
-- Backfill existing vendors as approved so they stay visible
update vendors set status = 'approved' where status = 'pending';

-- ─── Events: photo URL ────────────────────────────────────────────────────────
alter table events add column if not exists photo_url text;

-- ─── Events: duplicate category preference ────────────────────────────────────
alter table events add column if not exists allow_duplicate_categories boolean not null default true;

-- ─── Events: vendor discovery preference ─────────────────────────────────────
-- 'browse' = host browses only, 'apply' = vendors can apply, 'both' = both
alter table events add column if not exists vendor_discovery text not null default 'both';

-- ─── Auth: link vendors and events to Supabase Auth users ────────────────────
alter table vendors add column if not exists user_id uuid;
alter table events  add column if not exists user_id uuid;
create index if not exists vendors_user_id_idx on vendors (user_id);
create index if not exists events_user_id_idx  on events  (user_id);

-- ─── Stripe: vendor subscription fields ─────────────────────────────────────
alter table vendors add column if not exists stripe_customer_id     text;
alter table vendors add column if not exists stripe_subscription_id text;
alter table vendors add column if not exists subscription_status    text not null default 'none';
-- subscription_status values: 'none', 'active', 'past_due', 'canceled', 'trialing'
create index if not exists vendors_stripe_customer_idx on vendors (stripe_customer_id);

-- ─── Booking Requests ─────────────────────────────────────────────────────────
create table if not exists booking_requests (
  id                   bigint       primary key,
  session_id           text         not null,
  vendor_id            text,
  vendor_name          text,
  vendor_emoji         text,
  vendor_category      text,
  host_name            text,
  host_email           text,
  event_name           text,
  event_type           text,
  event_zip            text,
  event_date           text,
  start_time           text,
  end_time             text,
  address              text,
  attendance           text,
  vendor_count         text,
  budget               text,
  notes                text,
  is_recurring         boolean      default false,
  recurrence_frequency text,
  recurrence_day       text,
  recurrence_end_type  text,
  recurrence_end_date  text,
  recurrence_count     text,
  recurrence_notes     text,
  categories_needed    text[]       default '{}',
  subcategories_needed text[]       default '{}',
  status               text         not null default 'pending',
  sent_at              timestamptz,
  responded_at         timestamptz,
  vendor_message       text         default '',
  created_at           timestamptz  not null default now()
);

-- Unique token for vendor response links (no auth needed)
alter table booking_requests add column if not exists response_token text unique;

create index if not exists booking_requests_session_idx on booking_requests (session_id);
create index if not exists booking_requests_token_idx   on booking_requests (response_token);

alter table booking_requests enable row level security;

create policy "Anon read booking requests"
  on booking_requests for select using (true);

create policy "Anon insert booking requests"
  on booking_requests for insert with check (true);

create policy "Anon update booking requests"
  on booking_requests for update using (true);

-- ─── Supabase Storage: vendor-files bucket ───────────────────────────────────
-- Run these in the Supabase SQL Editor to create the storage bucket + policies.
-- This creates a PUBLIC bucket so vendor photos are viewable by anyone.

insert into storage.buckets (id, name, public)
values ('vendor-files', 'vendor-files', true)
on conflict (id) do nothing;

-- Allow anyone to read files (public photos/lookbooks)
create policy "Public read vendor files"
  on storage.objects for select
  using (bucket_id = 'vendor-files');

-- Allow anon uploads (vendors submit without auth)
create policy "Anon upload vendor files"
  on storage.objects for insert
  with check (bucket_id = 'vendor-files');

-- Allow anon to overwrite their own uploads (upsert)
create policy "Anon update vendor files"
  on storage.objects for update
  using (bucket_id = 'vendor-files');

-- ─── Optional: seed the sample data ─────────────────────────────────────────
-- Uncomment to load the sample vendors from the app

-- insert into vendors (name, category, home_zip, radius, emoji, tags, price, description, insurance, has_min_purchase, min_purchase_amt, charges_private_fee, private_event_fee)
-- values
--   ('Subtle Boujee',           'Jewelry & Accessories', '08033', 20, '💎', array['Handmade','Luxury','Custom'],              '$150–$300/day', 'Elevated handmade jewelry and accessories for every occasion.',        true,  true,  25, true,  200),
--   ('Ian''s Essentials',       'Health & Wellness',     '08107', 15, '🌿', array['Organic','Self-care','Local'],              '$100–$200/day', 'Curated wellness and essential products made with care.',               true,  false,  0, false,   0),
--   ('Shore Thing Candles',     'Candles & Home Decor',  '08226', 30, '🕯️', array['Hand-poured','Shore-inspired','Gift-ready'],'$75–$150/day',  'Hand-poured soy candles inspired by South Jersey''s shoreline.',       false, true,  15, false,   0),
--   ('Rooted & Raw Botanicals', 'Plants & Floral',       '08033', 20, '🌸', array['Sustainable','Seasonal','Local'],            '$200–$400/day', 'Locally grown plants, floral arrangements, and botanical wellness.',   true,  false,  0, false,   0),
--   ('The Dough Collective',    'Food & Beverage',       '08057', 15, '🥐', array['Baked goods','Allergen-friendly','Custom'],  '$125–$250/day', 'Artisan baked goods with allergen-friendly options for every crowd.',  true,  false,  0, false,   0),
--   ('Pine Barrens Print Co.',  'Art & Prints',          '08055', 25, '🎨', array['NJ-inspired','Photography','Custom framing'],'$80–$180/day',  'Photography and art prints celebrating New Jersey''s landscapes.',     false, false,  0, false,   0);

-- insert into events (event_name, event_type, zip, date, start_time, end_time, booth_fee, spots, categories_needed, contact_name, contact_email, contact_phone, fb_link, deadline, notes, source)
-- values
--   ('Collingswood Spring Pop-Up Market',     'Pop-Up Market',      '08107', '2026-04-12', '10:00', '16:00', '$50/vendor', 20, array['Food & Beverage','Jewelry & Accessories','Art & Prints','Candles & Home Decor'], 'Maria Lopez',                    'maria@collmarkets.com',  '(856) 555-0101', 'https://facebook.com/events/', '2026-04-01', 'Outdoor market in Knight Park. Tables not provided. Electric available for 5 spots.', 'Facebook Group'),
--   ('Haddonfield Summer Artisan Fair',        'Community Festival', '08033', '2026-06-07', '09:00', '17:00', 'Free (vendors keep all sales)', 35, array['Art & Prints','Crafts & Handmade','Jewelry & Accessories','Plants & Floral'], 'Haddonfield Events Committee',   'events@haddonfield.com', '(856) 555-0202', 'https://facebook.com/events/', '2026-05-15', 'Annual summer fair on Kings Highway. High foot traffic. Tents required.',            'Facebook Group'),
--   ('Voorhees Wellness & Self-Care Expo',     'Pop-Up Market',      '08043', '2026-03-29', '11:00', '15:00', '$75/vendor',  12, array['Health & Wellness','Beauty & Skincare','Candles & Home Decor','Plants & Floral'], 'Jasmine Reed',                   'jasmine@wellnessexpo.com','(856) 555-0303', 'https://facebook.com/events/', '2026-03-20', 'Indoor venue. Tables provided. Insured vendors preferred.',                         'Host Submitted');
