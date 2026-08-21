# Karuhun — Guild Portal

Official guild portal for **Karuhun**, a guild in **Punishing: Gray Raven**. Displays real-time member data, competitive leaderboards, PPC calculations, strategy references, and guild administration tools.

[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Utility Scripts](#utility-scripts)
- [Deployment](#deployment)
- [Code Conventions](#code-conventions)
- [Contributing](#contributing)

---

## Features

| Feature | Description |
|---|---|
| Home | Dashboard overview: guild leaderboard, top operators, recruitment |
| Guild Hub | Full member roster across all four guild branches |
| Player Profile | Individual member profile with statistics |
| Character Inspect | Detail view of a player's constructs and equipment |
| Competitive Leaderboard | Competitive rankings across guild members |
| PPC (Phantom Pain Cage) | Boss database and tactical score calculator |
| Strategy References | Internal guild strategy guides and reference materials |
| Alliance Telemetry | Alliance activity statistics and guild metrics |
| Contact | Contact form and recruitment information |
| Admin | Guild data administration panel (authenticated via Supabase) |

---

## Tech Stack

| Category | Technology |
|---|---|
| Build Tool | [Vite 5](https://vitejs.dev/) |
| UI Framework | [React 18](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| UI Components | [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) |
| Backend / DB | [Supabase](https://supabase.com/) (Auth + PostgreSQL) |
| Game API | Huaxu API (guild and player data for Punishing: Gray Raven) |
| Deployment | [Vercel](https://vercel.com/) |

---

## Project Structure

```
karuhun/
├── public/                         # Static assets served as-is (not bundled)
│   └── videos/                     # Guild intro video
│
├── scripts/
│   └── export_guild_members.js     # Node.js script for exporting guild member snapshots
│
├── src/
│   ├── App.tsx                     # Root component + routing state
│   ├── main.tsx                    # React entry point
│   │
│   ├── assets/                     # Bundler-processed assets
│   │   └── contributors/           # Contributor avatars & badges
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── common/                 # Navbar, Footer, ScrollReveal, etc.
│   │   ├── guild/                  # Guild-specific display components
│   │   ├── home/                   # Home page sections
│   │   ├── reffs/                  # Strategy References page components
│   │   └── ui/                     # UI primitives (buttons, avatars, etc.)
│   │
│   ├── data/
│   │   ├── config/                 # Shared configs (guild branches)
│   │   ├── static/                 # Static data (PPC scores, reffs, siege, telemetry, contact)
│   │   ├── fallbacks/              # JSON fallback data used when the API is unavailable
│   │   └── generated/              # Script output — NOT committed to Git
│   │
│   ├── pages/                      # Full-page views
│   │   ├── HomePage.tsx
│   │   ├── GuildHubPage.tsx
│   │   ├── PlayerProfilePage.tsx
│   │   ├── CharacterInspectPage.tsx
│   │   ├── CompetitiveLeaderboardPage.tsx
│   │   ├── ReffsPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── GuildIntroOverlay.tsx
│   │   └── ppc/
│   │       ├── PpcPage.tsx
│   │       ├── BossesPage.tsx
│   │       └── ScoreCalculatorPage.tsx
│   │
│   ├── services/                   # API integration and utility layer
│   │   ├── apiService.ts           # Huaxu API wrapper with in-memory cache
│   │   ├── imageUtils.ts           # Asset URL helpers + GUILD_BRANCHES config
│   │   ├── rankingUtils.ts         # Ranking calculation logic
│   │   ├── recapService.ts         # Guild data snapshot and recap
│   │   └── supabase/
│   │       └── client.ts           # Supabase client initialization
│   │
│   ├── types/
│   │   └── index.ts                # All TypeScript interfaces and types
│   │
│   └── styles/
│       └── index.css               # Global styles and Tailwind directives
│
├── supabase/
│   └── rls_policies.sql            # Supabase Row Level Security policies
│
├── .env.example                    # Environment variable template
├── vercel.json                     # Vercel deployment config (SPA routing)
├── vite.config.ts                  # Vite config + path alias (@/)
└── tsconfig.json                   # TypeScript config
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) version **18+**
- npm 9+ (included with Node.js)

### Steps

1. Clone the repository
   ```bash
   git clone https://gitlab.com/gideonladiyo/karuhun.git
   cd karuhun
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Fill in the required values in `.env` (see [Environment Variables](#environment-variables)).

4. Start the dev server
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Commands

```bash
npm run build     # Production build (output to dist/)
npm run preview   # Preview the production build locally
npm run lint      # Check for TypeScript errors
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Huaxu Game API
VITE_HUAXU_API_URL=https://api.huaxu.app
VITE_HUAXU_API_KEY=your-api-key-here
VITE_HUAXU_ASSETS_URL=https://assets.huaxu.app/glb

# Google Sheets PPC Data
VITE_PPC_SHEET_CSV_URL=...
VITE_PPC_SHEET_DOC_URL=...

# Discord
VITE_DISCORD_INVITE_URL=https://discord.gg/karuhun

# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

> [!WARNING]
> All variables prefixed with `VITE_` are inlined into the JavaScript bundle by Vite and are **visible to the browser**. Do not store sensitive secret keys here. For keys that must remain private, proxy the request through a Supabase Edge Function instead.

> [!IMPORTANT]
> Never commit the `.env` file to the repository. It is already listed in `.gitignore`.

---

## Utility Scripts

### `scripts/export_guild_members.js`

A Node.js script that exports a snapshot of guild member data from the Huaxu API to a local JSON file.

```bash
# Make sure HUAXU_API_KEY is available in your environment
HUAXU_API_KEY=your-key node scripts/export_guild_members.js
```

Output is written to `src/data/generated/guild_members_comparison.json`. This folder is excluded from Git and should only be used locally or in CI pipelines.

---

## Deployment

The project is deployed on **Vercel** as a Single Page Application.

`vercel.json` is configured to redirect all paths to `index.html`, so deep links like `/player/ap/12345` or `/reffs/xyz` work correctly when accessed directly.

For manual deployment:
```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

---

## Code Conventions

| File Type | Convention | Example |
|---|---|---|
| Reusable React component | PascalCase | `Navbar.tsx` |
| Page / full-page view | PascalCase + `Page` suffix | `AdminPage.tsx` |
| Custom hook | camelCase + `use` prefix | `useGuildData.ts` |
| Service / utility | camelCase | `apiService.ts` |
| Static data | camelCase | `contactData.ts` |
| Folder | lowercase, plural | `components/`, `pages/` |

### Path Alias

The project uses the `@/` alias pointing to `src/`:

```ts
// Use this
import { GuildInfo } from '@/types';

// Avoid this
import { GuildInfo } from '../../../types';
```

---

## Contributing

This is an internal portal for guild Karuhun. If you are a guild member and want to contribute, see [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow.

---

*Maintained by guild Karuhun — Punishing: Gray Raven*
