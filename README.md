# CuraPix

A social movie discovery and curation app. Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase (auth, database, storage, realtime). Deploys to Vercel.

Pages: Landing/Onboarding, Home Feed, Explore (swipe deck), Search, Messages, Profile.

## Security note

This project runs **Next.js 15.5.18 + React 19**. Earlier drafts used Next 14.2.x, but as of the May 2026 Next.js security release, patches are no longer being issued for the 14.x line, so 15.5.18 (a currently-patched release) is used instead. This required two Next 15 API changes already applied in the code: `cookies()` in `lib/supabase/server.ts` is now awaited, and dynamic route `params` (in `profile/[username]` and `messages/[id]`) are now a `Promise` that's awaited before use.

If `npm audit` ever shows a `postcss` advisory nested under `node_modules/next/node_modules/postcss`, that's Next's own internal build tooling, not your app's runtime CSS pipeline — check for a newer Next.js patch release rather than force-downgrading.

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
   - `supabase/storage.sql` — the `post-images` storage bucket and its policies
   - `supabase/seed.sql` — 13 sample movies (Interstellar, The Dark Knight, Spirited Away, etc.)

### Enable Google's OAuth

1. In Supabase: **Authentication > Providers > Google** — toggle it on.
2. Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth client ID, type "Web application").
3. Add the redirect URI Supabase shows you (something like `https://<project-ref>.supabase.co/auth/v1/callback`) to the Google OAuth client's **Authorized redirect URIs**.
4. Paste the Google **Client ID** and **Client Secret** into the Supabase provider settings and save.
5. In **Authentication > URL Configuration**, set your **Site URL** (e.g. `http://localhost:3000` for dev, your Vercel domain for production) and add both as **Redirect URLs**.

### Set up Storage for post images

Run `supabase/storage.sql` in the SQL editor — it creates the public `post-images` bucket and policies so users can only upload/manage files under their own `<user_id>/` folder (which is exactly how `components/NewPostModal.tsx` uploads).

If you'd rather do it by hand: **Storage > Create a new bucket** named `post-images`, make it public, then add the same policies from `storage.sql`.

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
- Interactive pieces (swipe deck, like/bookmark toggles, tabs, search filters, new post modal, chat) are Client Components; everything else stays server-rendered.
- **New post creation**: the "+" button on Home, Search, and Profile opens `components/NewPostModal.tsx`, which uploads images to the `post-images` Storage bucket under `<user_id>/<uuid>.<ext>` and inserts a row into `public.posts`. Run `supabase/storage.sql` first so the bucket and its policies exist.
- **Realtime chat**: `/messages` lists conversations from `public.conversations` / `conversation_participants` / `messages`; tapping one opens `/messages/[id]`, which renders `components/ChatWindow.tsx`. It loads message history on the server, then subscribes to `postgres_changes` INSERT events on `public.messages` (already added to the `supabase_realtime` publication in `schema.sql`) so new messages from the other participant appear live, and sends new messages with an optimistic UI update.
- There's no "start a new conversation" UI yet — to test chat, insert a `conversations` row and two matching `conversation_participants` rows manually (or add a "new message" flow as a follow-up).
