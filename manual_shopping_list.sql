-- Create manual_shopping_list table in HarianKu database
create table if not exists public.manual_shopping_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  is_completed boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.manual_shopping_list enable row level security;

-- Create Policies for user security
create policy "Users can view their own manual shopping list" on public.manual_shopping_list
  for select using (auth.uid() = user_id);

create policy "Users can insert into their own manual shopping list" on public.manual_shopping_list
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own manual shopping list" on public.manual_shopping_list
  for update using (auth.uid() = user_id);

create policy "Users can delete from their own manual shopping list" on public.manual_shopping_list
  for delete using (auth.uid() = user_id);
