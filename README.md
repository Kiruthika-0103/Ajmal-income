# AJMALL · Ride Tracker

A responsive delivery-partner income and expense tracker built with React, Vite and Supabase.

## Features
- Email/password sign-up and sign-in
- Cloud-saved transactions (accessible from other devices after signing in)
- Track income by Rapido, Zomato, Swiggy, Uber or Other
- Track expenses by category
- Daily, weekly, monthly and all-time filters
- Automatic income, expense, net income and ride totals
- Edit records
- Soft-delete to **Recently Deleted**, restore, permanently delete, or empty trash
- Supabase Row Level Security: users can only access their own records
- Responsive desktop and mobile layout

## 1. Create the cloud database
1. Create a project at [Supabase](https://supabase.com/).
2. Open **SQL Editor** in your Supabase project.
3. Paste and run the complete contents of `supabase/schema.sql`.
4. In **Authentication → Providers**, make sure Email is enabled.
5. In **Project Settings → API** (or API Keys), copy the Project URL and the publishable/anon key. Never use a `service_role` or secret key in this frontend.

## 2. Configure the website
Install Node.js (LTS), then in this project folder run:

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your Supabase details:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
```

Start locally:

```bash
npm run dev
```

Open the local URL shown by Vite. Create your account and start adding records.

## 3. Publish to GitHub
Create a new empty repository on GitHub, then run these commands in this project folder:

```bash
git init
git add .
git commit -m "Build AJMALL ride tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ajmall.git
git push -u origin main
```

Do **not** upload `.env`. It is ignored by `.gitignore`.

## 4. Deploy the website (recommended: Vercel)
1. Sign in to [Vercel](https://vercel.com/) with GitHub.
2. Import your `ajmall` repository.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Add the two environment variables from `.env` in Vercel → Project Settings → Environment Variables.
5. Deploy. Add your deployed site URL in Supabase → Authentication → URL Configuration → Site URL and Redirect URLs.
6. Open your deployed site, sign up, and use AJMALL from any device.

## Data and deletion behavior
- Records are stored in Supabase, not just in the current browser.
- Moving a record to Recently Deleted sets `deleted_at`; it does not erase the record.
- Restore clears `deleted_at`.
- Permanent delete and Empty trash really remove records and cannot be undone.
- Keep your Supabase project active and protect your account credentials. Back up your Supabase data periodically.

## Important notes
- Cloud sync requires the Supabase setup above and an internet connection.
- This starter uses email/password authentication. If email confirmation is enabled, confirm your email before signing in.
- Do not commit API secrets or a Supabase service-role key to GitHub.
