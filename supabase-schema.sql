-- מי מכיר? שוהם - Database Schema
-- הרץ את זה ב-Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  email text,
  neighborhood text,
  avatar_url text,
  whatsapp_link text,
  linkedin_url text,
  profession text,
  description text,
  help_offer text,
  help_seek text,
  is_volunteer boolean default false,
  is_approved boolean default false,
  is_admin boolean default false,
  badges text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Categories
create table public.categories (
  id serial primary key,
  name text not null,
  icon text,
  slug text unique not null
);

-- Profile categories (many-to-many)
create table public.profile_categories (
  profile_id uuid references public.profiles on delete cascade,
  category_id int references public.categories on delete cascade,
  primary key (profile_id, category_id)
);

-- Community posts
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles on delete cascade,
  content text not null,
  category_id int references public.categories,
  created_at timestamptz default now()
);

-- Post responses / recommendations
create table public.post_responses (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade,
  author_id uuid references public.profiles on delete cascade,
  content text not null,
  recommended_profile_id uuid references public.profiles,
  created_at timestamptz default now()
);

-- Contact requests (to reveal phone/email)
create table public.contact_requests (
  id uuid default gen_random_uuid() primary key,
  from_id uuid references public.profiles on delete cascade,
  to_id uuid references public.profiles on delete cascade,
  status text default 'pending',
  created_at timestamptz default now(),
  unique(from_id, to_id)
);

-- Insert default categories
insert into public.categories (name, icon, slug) values
  ('עורך דין', '⚖️', 'lawyer'),
  ('רואה חשבון', '📊', 'accountant'),
  ('אינסטלטור', '🔧', 'plumber'),
  ('חשמלאי', '⚡', 'electrician'),
  ('מורה פרטי', '📚', 'tutor'),
  ('מורה נהיגה', '🚗', 'driving-instructor'),
  ('רפואה ובריאות', '🏥', 'health'),
  ('עיצוב ובנייה', '🏗️', 'construction'),
  ('טכנולוגיה ומחשבים', '💻', 'tech'),
  ('בייביסיטר / מטפלת', '👶', 'childcare'),
  ('ספורט וכושר', '⚽', 'sports'),
  ('התנדבות וקהילה', '🤝', 'volunteer'),
  ('עסקים ושיווק', '📈', 'business'),
  ('אחר', '✨', 'other');

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.profile_categories enable row level security;
alter table public.posts enable row level security;
alter table public.post_responses enable row level security;
alter table public.contact_requests enable row level security;

-- Profiles: anyone can read approved profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (is_approved = true);

-- Profiles: users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Profiles: users can insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Categories: anyone can read
create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

-- Profile categories: anyone can read
create policy "Profile categories are viewable by everyone"
  on public.profile_categories for select
  using (true);

-- Profile categories: users can manage their own
create policy "Users can manage own profile categories"
  on public.profile_categories for all
  using (auth.uid() = profile_id);

-- Posts: approved users can read
create policy "Approved users can read posts"
  on public.posts for select
  using (true);

-- Posts: approved users can create posts
create policy "Approved users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

-- Post responses: anyone can read
create policy "Anyone can read post responses"
  on public.post_responses for select
  using (true);

-- Post responses: approved users can respond
create policy "Approved users can respond to posts"
  on public.post_responses for insert
  with check (auth.uid() = author_id);

-- Contact requests: users can see their own requests
create policy "Users can see own contact requests"
  on public.contact_requests for select
  using (auth.uid() = from_id or auth.uid() = to_id);

-- Contact requests: logged in users can create
create policy "Logged in users can create contact requests"
  on public.contact_requests for insert
  with check (auth.uid() = from_id);

-- Contact requests: recipients can update status
create policy "Recipients can update contact request status"
  on public.contact_requests for update
  using (auth.uid() = to_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
