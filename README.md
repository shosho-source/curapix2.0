# CuraPix

A social movie discovery and curation app. Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase (auth, database, storage, realtime). Deploys to Vercel.

Pages: Landing/Onboarding, Home Feed, Explore (swipe deck), Search, Messages, Profile.

The app runs out of the box with mock data even without Supabase configured, so you can preview the UI immediately, then wire up the backend when ready.

## 1. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without a `.env.local` file, every page renders using the sample data in `lib/mock-data.ts` (matches the seed data below), and the "Log in with Google" button will show a message instead of erroring.

## 2. Set up Supabase

1. Create a project at https://supabase.com/dashboard.
2. In **Settings > API**, copy the **Project URL** and **anon public** key.
3. Copy `.env.local.example` to `.env.local` and fill in those two values:
   ```bash
   cp .env.local.example .env.local
   ```
4. In the Supabase dashboard, open the **SQL Editor** and run, in order:
   - `supabase/schema.sql` — tables, triggers, and Row Level Security policies
   - `supabase/seed.sql` — 13 sample movies (Interstellar, The Dark Knight, Spirited Away, etc.)

### Enable Google OAuth

1. In Supabase: **Authentication > Providers > Google** — toggle it on.
2. Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth client ID, type "Web application").
3. Add the redirect URI Supabase shows you (something like `https://<project-ref>.supabase.co/auth/v1/callback`) to the Google OAuth client's **Authorized redirect URIs**.
4. Paste the Google **Client ID** and **Client Secret** into the Supabase provider settings and save.
5. In **Authentication > URL Configuration**, set your **Site URL** (e.g. `http://localhost:3000` for dev, your Vercel domain for production) and add both as **Redirect URLs**.

### Set up Storage for post images

1. In Supabase: **Storage > Create a new bucket** named `post-images`. Make it public (read).
2. Add policies so users can only upload/manage their own files, e.g. in the SQL editor:
   ```sql
   create policy "public read access"
     on storage.objects for select
     using (bucket_id = 'post-images');

   create policy "users upload to own folder"
     on storage.objects for insert
     with check (
       bucket_id = 'post-images'
       and (storage.foldername(name))[1] = auth.uid()::text
     );
   ```
   Upload images under a path like `post-images/<user_id>/<filename>` so this policy applies correctly.

### Create sample users + posts (optional, for a populated demo)

`auth.users` is managed by Supabase Auth, so test accounts can't be pre-seeded via plain SQL. Easiest path:

1. Sign in to the app 2–3 times with different Google accounts (or add users manually in **Authentication > Users**). A matching `public.users` row is created automatically by the `handle_new_user` trigger.
2. Then insert posts referencing those real user IDs — see the commented example at the bottom of `supabase/seed.sql`.

## 3. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In [Vercel](https://vercel.com/new), import the repo.
3. Add the environment variables under **Settings > Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel auto-detects Next.js — no extra build config needed.
5. Back in Supabase **Authentication > URL Configuration**, add your production Vercel URL (e.g. `https://curapix.vercel.app`) to **Site URL** and **Redirect URLs**, and add the same URL's `/auth/callback` where relevant.
6. If using a custom domain, update the Google OAuth client's authorized origins/redirect URIs to match.

## Project structure

```
app/
  page.tsx                  Landing/onboarding
  home/page.tsx              Home feed (Global/Friends/Recommended tabs)
  explore/page.tsx           Swipeable movie discovery deck
  search/page.tsx            Search, filters, carousel, genres, recommendations
  messages/page.tsx          Conversations list
  profile/[username]/page.tsx Profile with posts grid
  auth/callback/route.ts     OAuth code exchange
components/                  Shared UI (BottomNav, PostCard, SwipeDeck, etc.)
lib/
  supabase/client.ts          Browser Supabase client
  supabase/server.ts          Server Component Supabase client
  mock-data.ts                Fallback sample data
  types.ts                    Shared TypeScript types
supabase/
  schema.sql                  Tables, triggers, RLS policies
  seed.sql                    Sample movie data
middleware.ts                 Refreshes Supabase auth session cookies
```

## Notes

- Pages are Server Components that fetch from Supabase when configured, and fall back to `lib/mock-data.ts` otherwise — remove the fallback branches once your backend is populated, if you'd rather surface errors directly.
- Interactive pieces (swipe deck, like/bookmark toggles, tabs, search filters) are Client Components; everything else stays server-rendered.
- Real-time chat: subscribe to `public.messages` via Supabase Realtime (already added to the `supabase_realtime` publication in `schema.sql`) inside the messages page/component to push new messages live.
