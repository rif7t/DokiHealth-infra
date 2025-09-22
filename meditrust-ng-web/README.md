MediTrust — Mobile-first telemedicine starter (Next.js + Supabase)

Quick start:
1) Install deps: pnpm i
2) Copy .env.local.example to .env.local and fill Supabase keys
3) Run SQL in Supabase SQL editor: supabase.sql
4) Run dev: pnpm dev
Notes:
- Add http://localhost:3000 and http://localhost:3000/auth/callback as Redirect URLs in Supabase Auth.
- This is mobile-first; test with device toolbar or real phone.
