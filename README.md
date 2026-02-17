# Smart Bookmark App

A simple bookmark manager built with Next.js 15 (App Router), Supabase (Auth + Realtime), and Tailwind CSS.

## Features

- Google OAuth sign-in (no email/password)
- Add bookmarks (URL + title)
- Delete your own bookmarks
- Bookmarks are private per user
- Real-time updates across browser tabs (no page refresh needed)

## Tech Stack

- **Next.js 15** — App Router
- **Supabase** — Auth, Postgres Database, Realtime subscriptions
- **Tailwind CSS** — Styling
- **Vercel** — Deployment

---

## Problems I Ran Into & How I Solved Them

### 1. Real-time not working initially
**Problem:** The Supabase real-time channel was set up but changes weren't being reflected.  
**Fix:** Had to enable Replication on the `bookmarks` table in Supabase Dashboard → Database → Replication. Without this, `postgres_changes` events don't fire.

### 2. Google OAuth redirect URL mismatch
**Problem:** After signing in with Google, Supabase threw a "redirect_uri_mismatch" error.  
**Fix:** Had to add the exact callback URL (`https://<your-vercel-domain>/auth/callback`) to:  
  - Supabase Dashboard → Auth → URL Configuration → Redirect URLs  
  - Google Cloud Console → OAuth 2.0 → Authorized redirect URIs

### 3. Cookies in Server Components
**Problem:** Using `cookies()` from `next/headers` in the Supabase server client required `await` in Next.js 15.  
**Fix:** Updated the server client to `const cookieStore = await cookies()` — Next.js 15 made cookies() async.

### 4. Users seeing each other's bookmarks (RLS)
**Problem:** Without Row Level Security, any logged-in user could query all bookmarks.  
**Fix:** Enabled RLS on the `bookmarks` table and added policies so users can only SELECT/INSERT/DELETE their own rows (where `user_id = auth.uid()`).

---

## Local Setup

```bash
# 1. Clone and install
npm install

# 2. Copy env file and fill in your Supabase credentials
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase Setup

Run this SQL in Supabase SQL Editor:

```sql
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table bookmarks enable row level security;

-- Users can only see their own bookmarks
create policy "Users can view own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

-- Users can insert their own bookmarks
create policy "Users can insert own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

-- Users can delete their own bookmarks
create policy "Users can delete own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);
```

Then enable Realtime for the table:  
Supabase Dashboard → Database → Replication → Toggle `bookmarks` table ON.
