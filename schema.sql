-- HarianKu Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  goal text check (goal in ('makan_sehat', 'aktif_olahraga', 'keduanya')),
  onboarding_completed boolean default false,
  workout_target_weekly int default 3,
  auto_repeat_meal boolean default false,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;
create policy "Users can view and edit their own profiles" on public.profiles
  for all using (auth.uid() = id);

-- CATEGORIES
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  name text not null,
  color text not null, -- hex color
  created_at timestamptz default now()
);

alter table public.categories enable row level security;
create policy "Users can manage their own categories" on public.categories
  for all using (auth.uid() = user_id or user_id is null);

-- RECIPES
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  name text not null,
  description text,
  category_id uuid references public.categories on delete set null,
  tags text[],
  estimated_time_minutes int,
  servings int default 1,
  steps text[],
  is_favorite boolean default false,
  is_starter boolean default false,
  rating int check (rating >= 1 and rating <= 5),
  rating_notes text,
  created_at timestamptz default now()
);

alter table public.recipes enable row level security;
create policy "Users can manage their own recipes and starters" on public.recipes
  for all using (auth.uid() = user_id or is_starter = true);

-- RECIPE PHOTOS
create table if not exists public.recipe_photos (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes on delete cascade,
  url text not null,
  type text not null check (type in ('reference', 'result')),
  is_primary boolean default false,
  created_at timestamptz default now()
);

alter table public.recipe_photos enable row level security;
create policy "Users can manage photos of their own recipes" on public.recipe_photos
  for all using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and (r.user_id = auth.uid() or r.is_starter = true)
    )
  );

-- RECIPE INGREDIENTS
create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes on delete cascade,
  name text not null,
  amount numeric not null,
  unit text not null,
  price_per_unit numeric
);

alter table public.recipe_ingredients enable row level security;
create policy "Users can manage ingredients of their own recipes" on public.recipe_ingredients
  for all using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and (r.user_id = auth.uid() or r.is_starter = true)
    )
  );

-- MEAL PLANS
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  week_start date not null, -- Monday
  notes jsonb default '{}'::jsonb, -- { "1": "Mon note", "2": "Tue note", ... }
  created_at timestamptz default now(),
  unique(user_id, week_start)
);

alter table public.meal_plans enable row level security;
create policy "Users can manage their own meal plans" on public.meal_plans
  for all using (auth.uid() = user_id);

-- MEAL PLAN SLOTS
create table if not exists public.meal_plan_slots (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid references public.meal_plans on delete cascade,
  day_of_week int not null check (day_of_week between 1 and 7), -- 1=Monday, 7=Sunday
  slot text not null check (slot in ('sarapan', 'makan_siang', 'makan_malam', 'camilan')),
  recipe_id uuid references public.recipes on delete cascade,
  is_cooked boolean default false,
  cooked_at timestamptz
);

alter table public.meal_plan_slots enable row level security;
create policy "Users can manage slots on their own meal plans" on public.meal_plan_slots
  for all using (
    exists (
      select 1 from public.meal_plans mp
      where mp.id = meal_plan_id and mp.user_id = auth.uid()
    )
  );

-- TEMPLATE MEAL PLAN
create table if not exists public.meal_plan_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  name text not null,
  slots jsonb not null, -- snapshot of daily slots
  created_at timestamptz default now()
);

alter table public.meal_plan_templates enable row level security;
create policy "Users can manage their own templates" on public.meal_plan_templates
  for all using (auth.uid() = user_id);

-- STOCK ITEMS
create table if not exists public.stock_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  name text not null,
  amount numeric not null,
  unit text not null,
  price_per_unit numeric,
  threshold_amount numeric default 0,
  updated_at timestamptz default now()
);

alter table public.stock_items enable row level security;
create policy "Users can manage their own stock" on public.stock_items
  for all using (auth.uid() = user_id);

-- WORKOUT LOG
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  date date not null,
  type text not null check (type in ('jogging', 'gym', 'rumah')),
  proof_photo_url text,
  notes text,
  is_completed boolean default false,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.workout_logs enable row level security;
create policy "Users can manage their own workout logs" on public.workout_logs
  for all using (auth.uid() = user_id);

-- STREAKS
create table if not exists public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  week_start date not null,
  cooking_streak int default 0,
  workout_streak int default 0,
  cooking_days jsonb default '{}'::jsonb, -- { "1": "recipe_id_1", "2": "recipe_id_2" }
  workout_days jsonb default '{}'::jsonb, -- { "1": true, "3": true }
  unique(user_id, week_start)
);

alter table public.streaks enable row level security;
create policy "Users can manage their own streaks" on public.streaks
  for all using (auth.uid() = user_id);

-- BADGES & REWARDS
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text, -- emoji
  trigger_type text, -- 'cooking_streak_7' | 'workout_target'
  trigger_value int,
  created_by uuid references public.profiles on delete set null
);

alter table public.badges enable row level security;
create policy "Everyone can read badges" on public.badges
  for select using (true);
create policy "Only admins can manage badges" on public.badges
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- USER BADGES
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  badge_id uuid references public.badges on delete cascade,
  earned_at timestamptz default now()
);

alter table public.user_badges enable row level security;
create policy "Users can view and earn their own badges" on public.user_badges
  for all using (auth.uid() = user_id);

-- Trigger to automatically create user profile when user registers via Supabase auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
