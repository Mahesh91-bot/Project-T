Project-T
# TIPSY — Digital Tipping Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=000" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=fff" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=fff" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=fff" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Supabase-v2-3ECF8E?logo=supabase&logoColor=000" alt="Supabase" />
</p>

TIPSY bridges the gap between customers and service workers in a cashless world. Customers scan a worker’s QR code, tip digitally (e.g., UPI/cards), and optionally leave a review. Workers get direct deposits and dashboards; business owners manage workers and track performance.

- **Live Stack**: React + Vite + TypeScript + Tailwind CSS
- **Backend-as-a-Service**: Supabase (Auth, Postgres, RLS policies)
- **QR Codes**: Generated client-side for each worker profile
- **Routing**: React Router v7

---

## ✨ Features

- **Role-based access**: `worker` and `owner` with protected routes.
- **Auth & Profiles**: Email/password auth via Supabase; `user_profiles` table for metadata.
- **Digital tipping flow**: QR → Tip → Review.
- **Worker Dashboard**: QR code, earnings, tip history, rating summary.
- **Owner Dashboard**: Manage workers, aggregate earnings, tips, and ratings.
- **Public tipping**: Anyone can tip and leave a review without logging in.

---

## 🗺️ App Structure

```
src/
  components/
    Navbar.tsx           # Top navigation with auth/role-aware controls
    ProtectedRoute.tsx   # Guards routes by auth and optional role
  contexts/
    AuthContext.tsx      # Supabase auth provider, profile fetch, helpers
  lib/
    supabase.ts          # Supabase client (VITE_SUPABASE_URL/ANON_KEY)
  pages/
    Home.tsx             # Marketing/feature overview + CTAs
    Login.tsx            # Email/password login
    SignUp.tsx           # Role-select signup (worker/owner)
    WorkerDashboard.tsx  # QR, stats, recent tips
    OwnerDashboard.tsx   # Manage workers, stats table
    TipPage.tsx          # Public tipping for a worker
    ReviewPage.tsx       # Post-payment rating & review
  App.tsx                # Routes
  main.tsx               # App bootstrap
  index.css              # Tailwind layers
```

---

## 🧰 Tech Stack

- React 18, TypeScript, Vite 5
- Tailwind CSS 3 for styling
- Supabase JS v2: Auth + Postgres + RLS
- lucide-react icons, qrcode for QR generation

---

## 🗄️ Database Schema (Supabase)

The migration `supabase/migrations/20250917163046_polished_wood.sql` provisions:

- `user_profiles` (id, email, name, role ['worker'|'owner'], business_name?, upi_id?, timestamps)
- `tips` (id, worker_id → user_profiles.id, amount, customer_name, rating?, review?, created_at)
- `business_workers` (owner_id, worker_id unique pairs)
- Indexes on worker_id/owner_id/created_at
- RLS policies enabling:
  - Public read of worker profiles (limited) for tipping
  - Public insert/update of tips (for review step)
  - Workers read own tips; owners read tips of their workers
  - Owners manage their `business_workers`

Run this migration in your Supabase project or replicate these tables/policies manually in the SQL editor.

---

## 🚀 Getting Started

### 1) Prerequisites
- Node.js 18+
- A Supabase project (URL + anon key)

### 2) Clone and install
```bash
git clone <your-fork-or-repo-url> tipsy
cd tipsy
npm install
```

### 3) Configure environment
Create a `.env` (or `.env.local`) in project root with:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
These variables are consumed in `src/lib/supabase.ts`.

### 4) Apply database schema
- Open Supabase SQL editor and run the contents of:
  - `supabase/migrations/20250917163046_polished_wood.sql`

### 5) Start the dev server
```bash
npm run dev
```
Visit the URL shown by Vite (usually `http://localhost:5173`).

---

## 🔐 Auth & Roles

- Sign up as a `worker` or `owner` from `SignUp.tsx`.
- Workers provide a `upi_id`.
- Owners can optionally set `business_name` and later add workers by email from `OwnerDashboard.tsx`.
- `ProtectedRoute` ensures only authenticated users (and correct roles) can access dashboards.

---

## 💸 Tipping Flow (Public)

1. Customer scans a worker QR from the worker’s dashboard (or uses `/tip/:workerId`).
2. On `TipPage`, choose amount or enter custom, optionally add name.
3. A tip record is inserted; then redirected to `/review/:workerId` with context.
4. On `ReviewPage`, leave a star rating and optional review. High ratings simulate public sharing.

Note: Payment processing is simulated in the current implementation. Integrate real UPI/card gateways as needed.

---

## 📊 Dashboards

- Worker: earnings total, tips today, average rating, total tips, QR code, recent tips list.
- Owner: total workers, earnings, average rating, total tips, sortable worker table, add worker by email.

---

## 🧩 Key Routes

- `/` Home
- `/login`, `/signup`
- `/worker-dashboard` (protected, role: worker)
- `/owner-dashboard` (protected, role: owner)
- `/tip/:workerId` (public)
- `/review/:workerId` (public)

---

## 🖼️ Icons & UI

- Icons via `lucide-react` (e.g., DollarSign, Star, QrCode)
- Utility-first styles via Tailwind; see `tailwind.config.js` and `src/index.css`.

---

## 🧪 Linting

```bash
npm run lint
```
Uses ESLint with TypeScript config and React hooks/refresh plugins.

---

## 🏗️ Extending the App

- Replace simulated payments in `TipPage.tsx` with a real provider.
- Add webhooks to record payment confirmations.
- Build worker payouts or withdrawal flows if not using direct deposits.
- Add pagination/filters to dashboards.
- Implement email verification and password reset via Supabase.

---

## 🔒 Security Notes

- RLS policies allow public tip inserts and review updates by design; adjust for your compliance needs.
- Do not expose service keys in the client. Only use the `anon` key in the web app.

---

## 📜 License

MIT. See `LICENSE` (create one if distributing publicly).
