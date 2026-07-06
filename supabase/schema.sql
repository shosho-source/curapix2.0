-- CuraPix database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- ============ EXTENSIONS ============
create extension if not exists "uuid-ossp";

-- ============ USERS ============
-- Mirrors auth.users with public profile data.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  cover_avatar_url text,
  bio text,
  genre_prefs text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Auto-create a public profile row whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)) || '_' || substr(new.id::text, 1, 4),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============ MOVIES ============
create table if not exists public.movies (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  year int not null,
  genres text[] not null default '{}',
  poster_url text not null,
  backdrop_url text,
  synopsis text,
  rating numeric(3,1),
  trailer_url text,
  created_at timestamptz not null default now()
);

-- ============ POSTS ============
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  image_urls text[] not null default '{}',
  caption text,
  movie_id uuid references public.movies(id) on delete set null,
  -- Denormalized counters, kept in sync by triggers below so the feed can
  -- read counts directly off posts without extra aggregate queries.
  like_count int not null default 0,
  comment_count int not null default 0,
  share_count int not null default 0,
  bookmark_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists posts_user_id_idx on public.posts(user_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);

-- ============ LIKES ============
create table if not exists public.likes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- ============ COMMENTS ============
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ============ BOOKMARKS ============
create table if not exists public.bookmarks (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- Keeps posts.like_count / comment_count / bookmark_count in sync.
create or replace function public.sync_post_counter()
returns trigger as $$
declare
  target_post_id uuid;
  column_name text;
begin
  target_post_id := coalesce(new.post_id, old.post_id);
  column_name := tg_argv[0];

  if tg_op = 'INSERT' then
    execute format('update public.posts set %I = %I + 1 where id = $1', column_name, column_name)
      using target_post_id;
  elsif tg_op = 'DELETE' then
    execute format('update public.posts set %I = greatest(%I - 1, 0) where id = $1', column_name, column_name)
      using target_post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_like_change on public.likes;
create trigger on_like_change
  after insert or delete on public.likes
  for each row execute procedure public.sync_post_counter('like_count');

drop trigger if exists on_comment_change on public.comments;
create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute procedure public.sync_post_counter('comment_count');

drop trigger if exists on_bookmark_change on public.bookmarks;
create trigger on_bookmark_change
  after insert or delete on public.bookmarks
  for each row execute procedure public.sync_post_counter('bookmark_count');

-- ============ FOLLOWS ============
create table if not exists public.follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ============ WATCHLIST ============
create table if not exists public.watchlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  movie_id uuid not null references public.movies(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, movie_id)
);

-- ============ SWIPES ============
create table if not exists public.swipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  movie_id uuid not null references public.movies(id) on delete cascade,
  direction text not null check (direction in ('left', 'right')),
  created_at timestamptz not null default now(),
  unique (user_id, movie_id)
);

-- ============ CONVERSATIONS ============
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  is_group boolean not null default false,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

-- ============ MESSAGES ============
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_conversation_id_idx on public.messages(conversation_id, created_at);

-- Bumps the conversation's updated_at whenever a new message arrives, so
-- conversation lists can be sorted by recency with a simple order-by.
create or replace function public.touch_conversation()
returns trigger as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_message_inserted on public.messages;
create trigger on_message_inserted
  after insert on public.messages
  for each row execute procedure public.touch_conversation();

-- ============ ROW LEVEL SECURITY ============
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.bookmarks enable row level security;
alter table public.follows enable row level security;
alter table public.watchlist enable row level security;
alter table public.swipes enable row level security;
alter table public.movies enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Movies are public read-only reference data.
create policy "movies are viewable by everyone" on public.movies
  for select using (true);

-- Profiles are publicly viewable; users can only edit their own.
create policy "profiles are viewable by everyone" on public.users
  for select using (true);
create policy "users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Posts are publicly viewable; only the author can write/edit/delete.
create policy "posts are viewable by everyone" on public.posts
  for select using (true);
create policy "users can insert own posts" on public.posts
  for insert with check (auth.uid() = user_id);
create policy "users can update own posts" on public.posts
  for update using (auth.uid() = user_id);
create policy "users can delete own posts" on public.posts
  for delete using (auth.uid() = user_id);

-- Likes / bookmarks / comments: viewable by everyone, owned by the actor.
create policy "likes are viewable by everyone" on public.likes
  for select using (true);
create policy "users manage own likes" on public.likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "bookmarks are viewable by everyone" on public.bookmarks
  for select using (true);
create policy "users manage own bookmarks" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "comments are viewable by everyone" on public.comments
  for select using (true);
create policy "users manage own comments" on public.comments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Follows: viewable by everyone, only the follower can create/remove.
create policy "follows are viewable by everyone" on public.follows
  for select using (true);
create policy "users manage own follows" on public.follows
  for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

-- Watchlist and swipes are private to each user.
create policy "users manage own watchlist" on public.watchlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own swipes" on public.swipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Conversations / messages are only visible to participants.
create policy "participants can view their conversations" on public.conversations
  for select using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = id and cp.user_id = auth.uid()
    )
  );

create policy "participants can view participant rows" on public.conversation_participants
  for select using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
    )
  );

create policy "participants can view messages" on public.messages
  for select using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
    )
  );
create policy "participants can send messages" on public.messages
  for insert with check (
    auth.uid() = sender_id and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
    )
  );

-- ============ REALTIME ============
alter publication supabase_realtime add table public.messages;
