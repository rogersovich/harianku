-- Create cooking_history table
create table if not exists public.cooking_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  recipe_id uuid references public.recipes on delete set null,
  recipe_name_snapshot text not null,
  recipe_photo_snapshot text,
  slot_type text not null check (slot_type in ('sarapan', 'makan_siang', 'makan_malam', 'camilan')),
  cooked_at timestamptz default now() not null
);

-- Enable RLS
alter table public.cooking_history enable row level security;

-- Create Policies
create policy "Users can view their own cooking history" on public.cooking_history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own cooking history" on public.cooking_history
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own cooking history" on public.cooking_history
  for delete using (auth.uid() = user_id);
