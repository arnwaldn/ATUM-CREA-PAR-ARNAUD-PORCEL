-- Migration: Profiles table with RLS
-- Stores user profile data linked to auth.users

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  email text not null,
  full_name text,
  avatar_url text,
  stripe_customer_id text unique,
  subscription_status text check (subscription_status in ('active', 'canceled', 'past_due', 'trialing')),
  subscription_plan text
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (
  auth.uid() = id
  AND authenticative.is_user_authenticated()
);

-- Policy: Users can update their own profile
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (
  auth.uid() = id
  AND authenticative.is_user_authenticated()
)
with check (
  auth.uid() = id
  AND authenticative.is_user_authenticated()
);

-- Policy: Service role can do anything (for webhooks)
create policy "Service role full access"
on public.profiles
to service_role
using (true)
with check (true);

-- Function to handle new user signups
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger to auto-update updated_at
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

-- Index for faster lookups
create index if not exists profiles_stripe_customer_id_idx on public.profiles(stripe_customer_id);
create index if not exists profiles_subscription_status_idx on public.profiles(subscription_status);

-- Grant permissions
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
