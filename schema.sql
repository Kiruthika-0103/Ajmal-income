-- AJMALL database setup (run once in Supabase SQL Editor)
create extension if not exists pgcrypto;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('income','expense')),
  platform text check (platform in ('Rapido','Zomato','Swiggy','Uber','Other')),
  category text,
  amount numeric(12,2) not null check (amount > 0),
  rides integer not null default 0 check (rides >= 0),
  date date not null default current_date,
  notes text not null default '',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transaction_kind_fields check (
    (kind = 'income' and platform is not null) or
    (kind = 'expense' and category is not null)
  )
);

create index if not exists transactions_user_date_idx
  on public.transactions(user_id, date desc);
create index if not exists transactions_user_deleted_idx
  on public.transactions(user_id, deleted_at);

alter table public.transactions enable row level security;

drop policy if exists "Users can view their own transactions" on public.transactions;
create policy "Users can view their own transactions"
  on public.transactions for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own transactions" on public.transactions;
create policy "Users can insert their own transactions"
  on public.transactions for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own transactions" on public.transactions;
create policy "Users can update their own transactions"
  on public.transactions for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can permanently delete their own transactions" on public.transactions;
create policy "Users can permanently delete their own transactions"
  on public.transactions for delete to authenticated
  using (auth.uid() = user_id);

-- Optional: automatically maintain updated_at on edits.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists transactions_updated_at on public.transactions;
create trigger transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();
