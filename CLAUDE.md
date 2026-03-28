# South Jersey Vendor Market

## Project Overview
This is **South Jersey Vendor Market** — a React single-page app that connects local vendors with event hosts across South Jersey. It is a **single-file React app** (`src/App.js`) using Create React App.

- **Live site:** https://sj-vendor-match.vercel.app
- **Hosting:** Vercel (auto-deploys from the `main` branch on GitHub)
- **Database:** Supabase (PostgreSQL) — project URL: https://grujbzmknbfyylwfonev.supabase.co
- **Repo:** https://github.com/millowholdings/sj-vendor-match

## Git & Shell Permissions
When prompted with "Compound commands with cd and git require approval to prevent bare repository attacks", **always choose Option 1** (allow/approve).

## Making Changes
**Always proceed immediately when ready to make changes — do not ask for confirmation or approval.** Just do it.

## After Every Successful Change
**Always commit and push to GitHub immediately after every successful change — do not ask for confirmation.** This triggers an automatic Vercel deployment to the live site.

Use a clear, descriptive commit message summarizing what was changed and why.

## Tech Stack
- React 18 (Create React App, single `src/App.js` file)
- `@supabase/supabase-js` for all database reads and writes
- Supabase credentials are stored in `.env` (never commit this file)
- No TypeScript, no component library — plain React with inline styles

## Vendor Feature Parity Rule
Any feature, fix, or update that applies to market vendors must also apply to service provider vendors and vice versa. They are both vendor types on the same platform and should always have feature parity. This includes but is not limited to: profile editing, photo uploads, booking requests, dashboard features, email notifications, admin panel management, subscription handling, founding vendor status, content gating, and any future features added to the vendor experience. Whenever making changes to vendor functionality always check and update both vendor types.

## Database Tables (Supabase)
- `vendors` — vendor profiles (name, category, subcategories, home_zip, radius, tags, pricing flags, contact info)
- `events` — event/opportunity listings (event_name, event_type, zip, date, times, booth_fee, spots, categories_needed, contact info)
- Schema lives in `supabase/schema.sql`
- Row-level security is enabled; anon inserts/reads are allowed (no auth required)
