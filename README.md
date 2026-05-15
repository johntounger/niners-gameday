# Niners Gameday

A tiny web app for the Section 129 · Row 4 crew (John, Marilyn, Justin) to track
tailgate plans, guests, and parking for every 49ers home game at Levi's Stadium.

- Open URL is the only "security" — share the link with whoever you want to edit.
- All three of you can edit at the same time; changes appear live (Supabase realtime).
- 8 games are pre-loaded for the 2026 season.

## What's inside

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (Postgres + realtime)
- **Tailwind CSS** for layout, a small `globals.css` for the gradients and the
  opponent-color logo halo
- **Open-Meteo** for free weather forecasts (no API key)
- Hosted on **Vercel**

You don't have to be a developer to deploy this. The steps below are written
for someone who has never used Supabase or Vercel.

---

## Deploy guide

### 1. Create the Supabase database  (~15 minutes)

1. Go to <https://supabase.com> and click **Start your project** (top right).
   Sign in with GitHub or with an email + password.
2. Once you're in the dashboard, click the big green **New project** button.
3. Fill in the form:
   - **Name:** `niners-gameday` (anything you want)
   - **Database password:** click **Generate a password**, then **copy it
     somewhere safe**. You won't need it for this app, but you can't recover it later.
   - **Region:** pick the one closest to San Francisco — **West US (North California)**
     or **West US (Oregon)**.
   - Plan: **Free** is plenty.
4. Click **Create new project**. Wait about 2 minutes for the green check mark.
5. In the left sidebar click **SQL Editor** (looks like `</>`).
6. Click **+ New query**.
7. Open the file `supabase/schema.sql` in this project, copy everything in it,
   paste it into the editor, then click the green **Run** button.
   You should see "Success. No rows returned" at the bottom.
8. Click **+ New query** again.
9. Open `supabase/seed.sql`, copy everything, paste, **Run**.
   This time the message says "Success. No rows returned" — that's fine; the
   inserts happened.
10. In the left sidebar click **Table editor** and confirm you see 8 rows in the
    `games` table and 24 rows in `guests` (3 hosts × 8 games).
11. In the left sidebar click **Project Settings** (gear icon, bottom-left) →
    **API**. Keep this tab open — you'll need two things from it in step 3:
    - **Project URL** (top of the page, looks like `https://abcd1234.supabase.co`)
    - **anon public** key (under "Project API keys", click the eye icon to
      reveal it, then the clipboard icon to copy)

### 2. Put the code on GitHub  (~5 minutes)

You can skip GitHub and upload directly to Vercel, but GitHub makes future
edits easier.

1. Go to <https://github.com> and sign in (or create an account — it's free).
2. Click **+** (top right) → **New repository**.
3. Name it `niners-gameday`. Keep it **Private**. Don't tick any of the
   "initialize with" boxes. Click **Create repository**.
4. GitHub now shows a page with command lines. You'll do the version that says
   "**…or push an existing repository from the command line**":
   - Open a terminal on your Mac.
   - `cd` into the `niners-gameday` folder.
   - Copy-paste each command GitHub shows you (one at a time). They look like:
     ```
     git init
     git add .
     git commit -m "first commit"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/niners-gameday.git
     git push -u origin main
     ```
   - If `git` asks you to sign in, follow its prompts. (On a fresh Mac, run
     `xcode-select --install` once if `git` says it's not installed.)
5. Refresh your GitHub page — your files are there.

### 3. Deploy to Vercel  (~10 minutes)

1. Go to <https://vercel.com> and click **Sign Up**. Choose **Continue with
   GitHub** and authorize Vercel.
2. On the dashboard, click **Add New… → Project**.
3. Vercel shows your GitHub repos. Find `niners-gameday` and click **Import**.
4. On the "Configure Project" screen:
   - Framework Preset: should auto-detect **Next.js**. Leave it.
   - **Don't** change the build commands.
   - Scroll down to **Environment Variables**. Add two:
     - Name: `NEXT_PUBLIC_SUPABASE_URL`
       Value: paste the **Project URL** from Supabase (step 1.11)
     - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
       Value: paste the **anon public** key from Supabase (step 1.11)
5. Click **Deploy**. Watch the logs scroll for ~2 minutes.
6. When you see "Your project has been deployed", click the **Visit** button.
7. You should see the Niners Gameday list with all 8 games.

### 4. Share with Marilyn and Justin

- Just text them the `*.vercel.app` URL. No login required.
- (Optional) In the Vercel dashboard → **Settings → Domains** you can attach a
  pretty domain like `niners.tounger.com` if you own one. Vercel walks you
  through the DNS records.

### 5. Swap the stadium photo (optional)

The hero banner uses a generic stadium photo from Unsplash. To use a real
Levi's photo:

1. Open `components/SeasonBanner.tsx` (or `app/globals.css` — the URL lives in
   the `.season-banner` rule).
2. Replace the `background-image` URL with one that points to your photo.
   The easiest hosting: drop the photo into a public folder anywhere (or
   upload to Supabase Storage) and use that URL.
3. Commit + push to GitHub. Vercel auto-deploys.

---

## Local development (optional)

If you want to run it on your laptop before deploying:

```bash
cd niners-gameday
npm install
cp .env.local.example .env.local
# Then edit .env.local and paste your two Supabase values.
npm run dev
```

Open <http://localhost:3000>.

---

## Editing on your phone

Just open the Vercel URL. Pull the page out of the menu and use "Add to Home
Screen" to make it feel like an app icon. Every section's `+ Add` button does
the same thing it does in the mockup: shows an inline input and saves on
**Add** / Enter. Tap the **×** on any row to remove it.

---

## File map

```
niners-gameday/
├── app/
│   ├── layout.tsx           Root layout, fonts, phone-frame wrapper
│   ├── page.tsx             Game list (server component)
│   ├── globals.css          Custom gradients, halos, fonts
│   └── game/[id]/page.tsx   Detail page (server fetch → client wrapper)
├── components/
│   ├── SeasonBanner.tsx     Stadium-photo hero
│   ├── GameCard.tsx
│   ├── PastGames.tsx        Collapsible past-games section
│   ├── GameDetailClient.tsx Realtime sync wrapper
│   ├── DetailHero.tsx       Countdown + GAMEDAY mode
│   ├── PlanSection.tsx
│   ├── GuestSection.tsx
│   ├── TailgateSection.tsx
│   ├── ShareSheet.tsx       Bottom-sheet share modal
│   ├── ParkingSection.tsx
│   ├── NotesSection.tsx
│   └── WeatherStrip.tsx     Open-Meteo, <14 days out
├── lib/
│   ├── supabase.ts          Shared Supabase client
│   ├── types.ts             Game / Guest / TailgateItem
│   ├── teams.ts             Opponent metadata
│   └── format.ts            Countdown, date, and share-text helpers
└── supabase/
    ├── schema.sql
    └── seed.sql
```
