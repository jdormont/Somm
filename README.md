# Somm

AI-powered personal sommelier. Snap a photo of any wine list or store shelf and get ranked, personalized recommendations based on your taste profile, past ratings, budget, and occasion.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (database, auth, and edge functions)
- An OpenAI API key with GPT-4o access

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The OpenAI API key is entered per-user in the app's Settings page and stored in the browser only.

### Database Setup

Run the migrations in order against your Supabase project. They are located in `supabase/migrations/` and handle:

1. Core schema (preferences, scan sessions, wine memories)
2. Wine memories table and adventurousness preference
3. Restaurant budget columns and scan context
4. User profiles with admin approval system

### Edge Functions

Deploy the `analyze-wine` edge function to your Supabase project. It handles wine list image analysis via OpenAI's GPT-4o vision model.

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

---

## How It Works

1. **Set your preferences** -- Choose wine types, regions, flavor profiles, avoidances, adventurousness level, and budgets.
2. **Scan a wine list** -- Photograph a restaurant menu or store shelf. Toggle between store and restaurant context.
3. **Get recommendations** -- The AI reads every wine in the image, applies your taste profile and history, and returns up to 5 ranked picks with reasoning, tasting notes, critic references, and food pairings.
4. **Build your cellar** -- Rate and save wines to your personal cellar. Your history improves future recommendations.

---

## Features

- **Wine Scanner** -- Camera or upload, store/restaurant context toggle, budget range, occasion notes.
- **Taste Profile** -- Wine types, regions, flavor descriptors, avoidances, adventurousness, dual budgets.
- **Wine Cellar** -- Personal wine journal with ratings, notes, stats, and filtering.
- **Dashboard** -- Recent scans with expandable details, save-to-cellar flow, setup prompts.
- **Admin Panel** -- User approval system, role management, access control.
- **Settings** -- OpenAI API key management (browser-only storage).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Icons | Lucide React |
| Routing | React Router v7 |
| Auth | Supabase Auth (email/password) |
| Database | Supabase PostgreSQL with Row Level Security |
| AI | OpenAI GPT-4o Vision via Supabase Edge Function |
| Image Processing | Browser Canvas API (client-side compression) |

---

## Project Structure

```
src/
  components/     UI components (Layout, WineCard, ImageUpload, ProtectedRoute)
  contexts/       React context providers (AuthContext)
  lib/            Utilities (Supabase client, image compression)
  pages/          Route pages (Dashboard, Scanner, Cellar, Preferences, etc.)
supabase/
  functions/      Edge functions (analyze-wine)
  migrations/     Database migration files
```

---

## Security

- Row Level Security on every database table -- users access only their own data.
- Admin approval required for all new accounts.
- OpenAI API keys stored in browser localStorage only, never persisted server-side.
- Edge function proxies all external API calls.
