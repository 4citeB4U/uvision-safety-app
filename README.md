# UVision Safety App

A pocket-based personal safety system that detects incidents via phone sensors, logs them to Supabase, correlates with nearby surveillance cameras, and provides a web dashboard—all without requiring user camera activation.

## Architecture

```
uvision-safety-app/
├── mobile/          # Expo React Native app (iOS & Android)
├── web/             # Next.js web dashboard (deployed on Vercel)
├── supabase/        # Database schema & migrations
└── vercel.json      # Vercel deployment configuration
```

## Features

- **10 Hz Accelerometer Monitoring** — detects freefall (total G-force < 0.2 g) or high-impact events (> 4 g)
- **Continuous GPS Tracking** — real-time location via `expo-location`
- **Incident Logging** — automatic Supabase insert on incident trigger (lat, lng, timestamp, max G-force)
- **Safety HUD** — full-screen map with surveillance camera overlays from OpenStreetMap Overpass API
- **Panic Button** — one-tap emergency trigger that immediately logs an incident
- **Web Dashboard** — Vercel-hosted Next.js app displaying incident history and map

---

## Mobile App (`/mobile`)

### Requirements

- Node.js ≥ 18
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator / Android Emulator, or physical device with Expo Go

### Setup

```bash
cd mobile
cp .env.example .env
# Fill in your Supabase & Google Maps credentials
npm install
npx expo start
```

### Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key (Android) |

### Required Permissions

- **Location** — always-on for background GPS tracking
- **Motion/Activity** — for accelerometer access

---

## Web Dashboard (`/web`)

### Setup

```bash
cd web
cp .env.example .env.local
# Fill in your Supabase credentials
npm install
npm run dev
```

### Vercel Deployment

1. Connect the repository to Vercel
2. Set the **Root Directory** to `web` (or use the provided `vercel.json`)
3. Add environment variables in the Vercel dashboard

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

---

## Database (`/supabase`)

Run `supabase/schema.sql` in the Supabase SQL editor to create the required tables and Row Level Security policies.

### `incidents` table

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` | Primary key |
| `latitude` | `float8` | Incident latitude |
| `longitude` | `float8` | Incident longitude |
| `timestamp` | `timestamptz` | When the incident occurred |
| `max_g_force` | `float8` | Peak G-force reading |
| `incident_type` | `text` | `'freefall'`, `'impact'`, or `'panic'` |

