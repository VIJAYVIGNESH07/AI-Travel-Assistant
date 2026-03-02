# Hidden Spot Supabase Setup

## 1) Add Environment Variables

Add these values in `.env`:

- `EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`

Then restart Expo:

- `npx expo start -c`

## 2) Create Table (SQL)

Run this in Supabase SQL editor:

```sql
create table if not exists public.hidden_spot_requests (
  id text primary key,
  submitted_by_name text not null,
  submitted_by_handle text not null,
  submitted_at timestamptz not null default now(),
  verify boolean not null default false,
  status text not null default 'pending',
  name text not null,
  location_label text not null,
  latitude double precision not null,
  longitude double precision not null,
  category text not null,
  description text not null,
  accessibility text,
  best_time text,
  image_base64_list jsonb not null default '[]'::jsonb,
  admin_decision_at timestamptz,
  admin_notes text not null default ''
);

create index if not exists idx_hidden_spot_verify on public.hidden_spot_requests (verify);
create index if not exists idx_hidden_spot_handle on public.hidden_spot_requests (submitted_by_handle);
create index if not exists idx_hidden_spot_submitted_at on public.hidden_spot_requests (submitted_at desc);
```

## 3) RLS (Quick Starter)

If RLS is enabled, create permissive policies for initial testing (tighten later):

```sql
alter table public.hidden_spot_requests enable row level security;

create policy "hidden_spot_select_all"
on public.hidden_spot_requests
for select
using (true);

create policy "hidden_spot_insert_all"
on public.hidden_spot_requests
for insert
with check (true);

create policy "hidden_spot_update_all"
on public.hidden_spot_requests
for update
using (true)
with check (true);
```

## 4) Notes

- Hidden Spot now uses Supabase when env vars are configured.
- If Supabase env is missing, app falls back to local JSON storage for compatibility.
- Explore only shows records with `verify = true` and matching current user handle.
