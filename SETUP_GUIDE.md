# 📘 Smart Bookmark App — Complete Setup & Deployment Guide

This guide walks you through every step from zero to a live Vercel URL.
No prior Vercel experience needed.

---

## 🗺️ Overview of Steps

1. Set up Supabase (database + auth)
2. Set up Google OAuth
3. Run the app locally
4. Deploy to Vercel
5. Connect everything (final URLs)

Estimated time: ~45–60 minutes on first try.

---

## STEP 1 — Set Up Supabase

Supabase is your backend: it handles user login AND stores the bookmarks.

### 1.1 Create a Supabase Account & Project

1. Go to https://supabase.com and click **Start your project**
2. Sign up (GitHub login works great)
3. Click **New Project**
4. Fill in:
   - **Name**: `smart-bookmark-app` (or anything you like)
   - **Database Password**: Choose a strong password and **save it somewhere** (you won't need it often, but good to have)
   - **Region**: Pick the one closest to you
5. Click **Create new project** — wait ~2 minutes for it to spin up

### 1.2 Create the Database Table

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste the following SQL and click **Run**:

```sql
-- Create the bookmarks table
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_at timestamptz default now()
);

-- Turn on Row Level Security (so users can't see each other's data)
alter table bookmarks enable row level security;

-- Policy: users can only see their OWN bookmarks
create policy "Users can view own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

-- Policy: users can only add their OWN bookmarks
create policy "Users can insert own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

-- Policy: users can only delete their OWN bookmarks
create policy "Users can delete own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);
```

You should see "Success. No rows returned." — that's correct.

### 1.3 Enable Real-time for the Table

This is what makes bookmarks appear in other tabs without refreshing.

1. In Supabase, go to **Database** → **Replication** (in left sidebar)
2. Under **Tables** section, find `bookmarks`
3. Toggle it **ON** (the toggle should turn green/blue)

### 1.4 Get Your Supabase API Keys

1. Go to **Settings** (gear icon) → **API**
2. Note down two things:
   - **Project URL** — looks like `https://xyzxyzxyz.supabase.co`
   - **anon / public key** — a long string starting with `eyJ...`

Keep these handy — you'll need them in Step 3 and Step 4.

---

## STEP 2 — Set Up Google OAuth

Google OAuth is how users log in. You need to create a "Google App" to get credentials.

### 2.1 Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click the project dropdown at the top → **New Project**
3. Name it `smart-bookmark-app` → click **Create**
4. Make sure your new project is selected in the dropdown

### 2.2 Create OAuth Credentials

1. In the left menu, go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. If prompted to configure consent screen first:
   - Click **Configure Consent Screen**
   - Choose **External** → click **Create**
   - Fill in:
     - App name: `Smart Bookmark App`
     - User support email: your email
     - Developer contact email: your email
   - Click **Save and Continue** through all steps (defaults are fine)
   - Click **Back to Dashboard**
4. Now click **+ Create Credentials** → **OAuth client ID** again
5. For Application type: choose **Web application**
6. Name: `Smart Bookmark App`
7. Under **Authorized redirect URIs**, click **+ Add URI** and add:
   ```
   https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
   ```
   > Replace `<YOUR-PROJECT-REF>` with the part before `.supabase.co` in your Project URL.
   > Example: if your URL is `https://abcdef123.supabase.co`, add `https://abcdef123.supabase.co/auth/v1/callback`
8. Click **Create**
9. A popup shows your **Client ID** and **Client Secret** — copy both and save them!

### 2.3 Enable Google Provider in Supabase

1. In Supabase, go to **Authentication** → **Providers**
2. Find **Google** and click to expand it
3. Toggle it **Enabled** ON
4. Paste your **Google Client ID** and **Google Client Secret** from the previous step
5. Click **Save**

---

## STEP 3 — Run the App Locally

### 3.1 Install Node.js (if not already installed)

Download from https://nodejs.org — install the **LTS** version.

Verify by running in terminal: `node --version` (should show v18 or higher)

### 3.2 Get the Code

If you downloaded the project files (from this guide), put them in a folder.

Or initialize a git repo:
```bash
# Navigate to the project folder in your terminal
cd smart-bookmark-app
```

### 3.3 Install Dependencies

```bash
npm install
```

This installs Next.js, Supabase SDK, Tailwind, etc.

### 3.4 Create Your .env.local File

1. In the project folder, create a file called `.env.local` (not `.env` — the `.local` part matters!)
2. Add this content:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJyour-long-anon-key-here
```

Replace the values with your actual Supabase URL and anon key from Step 1.4.

### 3.5 Add Localhost to Supabase Allowed URLs

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, click **Add URL**
3. Add: `http://localhost:3000/auth/callback`
4. Click **Save**

### 3.6 Start the Dev Server

```bash
npm run dev
```

Open http://localhost:3000 — you should see the login page!

Test the full flow:
- Click "Sign in with Google"
- Log in with your Google account
- You should be redirected to the dashboard
- Add a bookmark — try opening two browser tabs to test real-time!

---

## STEP 4 — Deploy to Vercel

Vercel is a hosting platform made by the creators of Next.js — it's the easiest way to deploy.

### 4.1 Push Your Code to GitHub

You need the code on GitHub for Vercel to deploy it.

1. Create a GitHub account at https://github.com if you don't have one
2. Click **+** → **New repository**
3. Name: `smart-bookmark-app`, set to **Public**
4. Click **Create repository**
5. In your terminal (inside the project folder):

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR-USERNAME/smart-bookmark-app.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

### 4.2 Create a Vercel Account

1. Go to https://vercel.com
2. Click **Sign Up** → choose **Continue with GitHub** (easiest!)
3. Authorize Vercel to access your GitHub

### 4.3 Import Your Project

1. In Vercel dashboard, click **Add New** → **Project**
2. Find your `smart-bookmark-app` repo and click **Import**
3. Framework Preset should auto-detect as **Next.js**
4. Click on **Environment Variables** section to expand it
5. Add two environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click **Deploy**

Wait ~2 minutes. Vercel will show a preview of your deployed app.

Your live URL will look like: `https://smart-bookmark-app-xxxx.vercel.app`

---

## STEP 5 — Final: Connect OAuth to Your Live URL

After deploying, you need to tell both Supabase and Google about your live URL.

### 5.1 Update Supabase Redirect URLs

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Under **Site URL**, set it to: `https://your-app.vercel.app`
3. Under **Redirect URLs**, add: `https://your-app.vercel.app/auth/callback`
4. Click **Save**

### 5.2 Update Google OAuth Redirect URI

1. Go to Google Cloud Console → **APIs & Services** → **Credentials**
2. Click on your OAuth client ID
3. Under **Authorized redirect URIs**, you already have the Supabase one
4. That's actually all you need — the Supabase callback URL handles everything

### 5.3 Test Your Live App!

1. Open your Vercel URL
2. Sign in with Google
3. Add some bookmarks
4. Open the same URL in a second tab — add a bookmark in one tab and watch it appear in the other instantly!

---

## 🎉 You're Done!

Your live URLs to submit:
- **Vercel URL**: `https://smart-bookmark-app-xxxx.vercel.app`
- **GitHub repo**: `https://github.com/YOUR-USERNAME/smart-bookmark-app`

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| "Invalid redirect URI" on login | Make sure the callback URL in Google Console matches exactly what Supabase uses |
| Bookmarks not showing in real-time | Check that Replication is enabled for the `bookmarks` table in Supabase |
| "User not found" after login | Make sure `/auth/callback` route is working — check Vercel function logs |
| Build fails on Vercel | Check that both env variables are set in Vercel project settings |
| Local works but Vercel doesn't | Double-check the env variable names — they must start with `NEXT_PUBLIC_` |
