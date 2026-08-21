# Contributing — Karuhun Web

Thanks for your interest in contributing to the Karuhun guild portal. This document covers the workflow and standards used in this project.

---

## Before You Start

1. Make sure you can run the project locally. Follow the steps in [README.md](./README.md#getting-started).
2. Ensure you have access to the GitLab repository.
3. For large changes (new major features, architectural changes), discuss in the guild Discord before writing code.

---

## Git Workflow

### 1. Create a new branch

Always branch off the latest `main`:

```bash
git checkout main
git pull origin main
git checkout -b <type>/<short-name>
```

Branch naming convention:

| Type | Use for | Example |
|---|---|---|
| `feat/` | New feature | `feat/recap-export` |
| `fix/` | Bug fix | `fix/navbar-mobile-overflow` |
| `refactor/` | Code refactor without behavior change | `refactor/folder-structure` |
| `docs/` | Documentation update | `docs/update-readme` |
| `chore/` | Maintenance (dependency updates, config) | `chore/update-tailwind-v4` |

### 2. Write code and commit

Keep commits granular — one commit per logical change. Use this format:

```
<type>: <short description>

[optional longer explanation]
```

Examples:
```
feat: add rank filter to Competitive Leaderboard
fix: fix broken image fallback in CharacterInspectPage
refactor: extract useGuildData hook from App.tsx
```

### 3. Before pushing — verify the build is clean

```bash
npm run lint    # no TypeScript errors
npm run build   # production build succeeds
```

### 4. Open a Merge Request

- Target branch: `main`
- Fill in the MR description: what changed, why, and how to test it
- Tag a maintainer for review before merging

---

## Code Standards

### TypeScript

- Avoid `any` — define proper interfaces and types, especially in complex pages (`CharacterInspectPage`, `CompetitiveLeaderboardPage`).
- Types and interfaces used in more than one file belong in `src/types/index.ts`.
- Run `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` before committing to catch unused declarations.

### React / Components

- **Reusable components** (used in more than one place, or generic in nature) go in `src/components/`.
- **Page-level views** (one file = one screen) go in `src/pages/`.
- Naming: PascalCase for all components and pages; pages use the `Page` suffix (e.g., `GuildHubPage.tsx`).

### Styling

- Use Tailwind utility classes. Avoid custom CSS unless strictly necessary.
- If you need global styles or custom animations, add them to `src/styles/index.css`.

### Imports

Always use the `@/` path alias for imports within `src/`:

```ts
// Correct
import { GuildInfo } from '@/types';
import { apiService } from '@/services/apiService';

// Avoid
import { GuildInfo } from '../../types';
```

---

## Things to Avoid

- Do not commit the `.env` file. Only `.env.example` belongs in the repository.
- Do not hardcode API keys in source code. Read them from `import.meta.env.VITE_*`.
- Do not commit the `src/data/generated/` folder. Its contents are auto-generated.
- Do not push directly to `main`. Always go through a Merge Request.
- Do not leave debug `console.log` statements in committed code. If you need development-only logging, use: `if (import.meta.env.DEV) console.log(...)`.

---

## Reference

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for a detailed explanation of the project architecture and design decisions.
