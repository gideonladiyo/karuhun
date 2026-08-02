# Implementation Plan: Restrukturisasi Folder `karuhun-web`

**Project:** karuhun-web (Vite + React 18 + TypeScript + Tailwind v4 + Supabase)
**Tujuan:** Merapikan struktur file/folder agar sesuai standar industri untuk aplikasi React/Vite skala menengah, tanpa mengubah behavior aplikasi.

---

## 1. Analisis Kondisi Saat Ini

```
karuhun-web/
├── .env / .env.example
├── guild_members_comparison.json     ⚠️ duplikat, harusnya generated-only
├── index.html
├── package.json / package-lock.json
├── tsconfig.json
├── vercel.json
├── vite.config.ts
├── README.md
├── scripts/
│   └── export_guild_members.js       ⚠️ API key hardcoded di source
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── vite-env.d.ts
    ├── Logo__4_-removebg-preview.png ⚠️ aset nyasar di root src, nama file mentah
    ├── intro karuhun v2 (no music).mp4 ⚠️ video 936KB nyasar di root src
    ├── assets/contributor/
    ├── components/                   ⚠️ 19 file: pages + components + modals dicampur
    ├── data/                         (fallback JSON + data statis campur)
    ├── services/                     ⚠️ ada file .sql di sini (bukan kode app)
    ├── styles/
    └── types/
```

### Masalah yang teridentifikasi

| # | Masalah | Dampak |
|---|---|---|
| 1 | `src/components/` mencampur *page-level views* (AdminPage 1137 baris, CharacterInspectPage 621 baris, GuildHub, dst) dengan *reusable components* (Navbar, Footer, Modal) | Sulit navigasi, sulit tahu mana yang boleh di-reuse mana yang route-specific |
| 2 | Aset besar (video, logo) diletakkan di `src/` root, di-import lewat bundler | Membengkakkan build/bundle jika ter-*import* sebagai module; harusnya static asset lewat `public/` |
| 3 | **API key hardcoded** di `scripts/export_guild_members.js`, padahal sudah ada `.env` | Risiko keamanan — key kemungkinan sudah ter-*commit* ke Git history |
| 4 | `guild_members_comparison.json` ada di 2 lokasi (root & `src/data/`) | Sumber kebingungan, tidak jelas mana yang jadi source of truth |
| 5 | File `.sql` (skema RLS Supabase) ditaruh di `src/services/` | Skema database bukan kode frontend, bikin bingung boundary |
| 6 | Tidak ada folder `pages/` maupun `hooks/` | Tidak eksplisit membedakan tampilan halaman vs logic reusable |
| 7 | Tidak ada path alias (`@/components`, dst) | Import relatif akan makin dalam (`../../..`) seiring project tumbuh |
| 8 | Penamaan file tidak konsisten: `ppc_scores.ts`, `contact_data.ts` (snake_case) vs `apiService.ts` (camelCase) | Menyulitkan konsistensi tim |
| 9 | Tidak ada ESLint/Prettier — script `lint` cuma `tsc --noEmit` | Tidak ada penegakan gaya kode |

---

## 2. Struktur Target (Industry Standard untuk Vite + React + TS)

```
karuhun-web/
├── public/                          # static assets, disajikan apa adanya (TIDAK di-bundle)
│   ├── logo.png                     # (dipindah & rename dari src/Logo__4_-removebg-preview.png)
│   └── videos/
│       └── guild-intro.mp4          # (dipindah & rename dari "intro karuhun v2 (no music).mp4")
│
├── src/
│   ├── assets/                      # aset yang memang perlu di-import/diproses bundler
│   │   └── contributors/
│   │       ├── karuhun-admin.png
│   │       └── larkshin.webp
│   │
│   ├── components/                  # HANYA reusable UI components (dipakai >1 tempat / generic)
│   │   ├── common/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MarkdownRenderer.tsx
│   │   └── modals/
│   │       ├── PlayerDetailModal.tsx
│   │       ├── CharacterDetailModal.tsx
│   │       └── GuildRulesModal.tsx
│   │
│   ├── pages/                       # route/full-page level views (1 file = 1 "halaman")
│   │   ├── GuildHubPage.tsx          (dari GuildHub.tsx)
│   │   ├── MemberListPage.tsx        (dari MemberList.tsx)
│   │   ├── PlayerProfilePage.tsx
│   │   ├── CharacterInspectPage.tsx
│   │   ├── CompetitiveLeaderboardPage.tsx (dari CompetitiveLeaderboard.tsx)
│   │   ├── ContactPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── ReffsPage.tsx
│   │   ├── GuildIntroOverlay.tsx
│   │   └── ppc/
│   │       ├── PpcPage.tsx
│   │       ├── BossesPage.tsx
│   │       └── ScoreCalculatorPage.tsx
│   │
│   ├── hooks/                       # BARU — ekstrak state/effect logic dari App.tsx
│   │   ├── useGuildData.ts           # fetch + loading state (dari App.tsx)
│   │   └── useRouteSync.ts           # parser pathname/hash (dari App.tsx)
│   │
│   ├── services/                    # HANYA kode client-side (API, integrasi eksternal)
│   │   ├── apiService.ts
│   │   ├── imageUtils.ts
│   │   ├── recapService.ts
│   │   └── supabase/
│   │       └── client.ts             (dari supabaseClient.ts)
│   │
│   ├── data/
│   │   ├── static/                  # data statis buatan tangan
│   │   │   ├── contactData.ts        (rename dari contact_data.ts)
│   │   │   ├── ppcScores.ts          (rename dari ppc_scores.ts)
│   │   │   └── reffsData.ts          (rename dari reffs_data.ts)
│   │   └── fallbacks/               # JSON fallback (tidak berubah isi)
│   │       ├── character.json
│   │       ├── guild.json
│   │       ├── ppc.json
│   │       ├── profile.json
│   │       └── warzone.json
│   │
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── index.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── supabase/                        # BARU — kode/skema DB, bukan bagian bundle frontend
│   └── rls_policies.sql             (dipindah dari src/services/supabase_rls_policies.sql)
│
├── scripts/
│   └── export_guild_members.js      # ⚠️ WAJIB diubah: baca key dari process.env, bukan hardcode
│
├── .env / .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
└── README.md
```

**Catatan:** `guild_members_comparison.json` di root **dihapus** — script generator diarahkan menulis hanya ke satu lokasi (`src/data/generated/`, ditambahkan ke `.gitignore` sebagai folder, bukan per-file).

---

## 3. Rencana Implementasi Bertahap

Kerjakan berurutan, commit terpisah tiap fase supaya mudah di-revert kalau ada yang salah.

### Fase 0 — Persiapan
1. Pastikan working tree bersih (`git status`), buat branch baru: `git checkout -b refactor/folder-structure`.
2. Jalankan `npm run build` sekali sebagai baseline — pastikan build sukses sebelum mulai.

### Fase 1 — Keamanan (prioritas tertinggi, kerjakan duluan & terpisah)
1. Di `scripts/export_guild_members.js`, ganti `HUAXU_API_KEY = '...'` menjadi baca dari `process.env.HUAXU_API_KEY` (pakai package `dotenv` kalau script dijalankan manual via Node, bukan Vite).
2. Tambahkan `HUAXU_API_KEY` ke `.env` dan `.env.example` (dengan placeholder di `.env.example`).
3. **Rotate/ganti key tersebut** di sisi provider (Huaxu), karena kemungkinan besar sudah tersimpan di history Git dan tidak aman lagi walau dihapus dari file.
4. Cek `git log -p -- scripts/export_guild_members.js` untuk konfirmasi apakah key sudah pernah ter-commit; jika ya, pertimbangkan `git filter-repo` / BFG untuk membersihkan history (opsional, tergantung sensitivitas).

### Fase 2 — Pindahkan aset statis
1. `mkdir public/videos`
2. Pindah & rename:
   - `src/Logo__4_-removebg-preview.png` → `public/logo.png`
   - `src/intro karuhun v2 (no music).mp4` → `public/videos/guild-intro.mp4`
3. Cari semua referensi import ke 2 file ini (`grep -rn "Logo__4\|intro karuhun" src/`) dan ganti jadi path absolut dari root, misal `<img src="/logo.png" />`, `<video src="/videos/guild-intro.mp4" />` (bukan `import`).
4. Rename file di `src/assets/contributor/` → `src/assets/contributors/` (opsional konsistensi plural) dan hilangkan spasi/nama ambigu jika ada.

### Fase 3 — Pisahkan `components/` menjadi `components/` + `pages/`
1. Buat folder `src/pages/`, `src/components/common/`, `src/components/modals/`.
2. Pindahkan file sesuai tabel:

   | File saat ini | Tujuan |
   |---|---|
   | `Navbar.tsx`, `Footer.tsx`, `MarkdownRenderer.tsx` | `components/common/` |
   | `PlayerDetailModal.tsx`, `CharacterDetailModal.tsx`, `GuildRulesModal.tsx` | `components/modals/` |
   | `GuildHub.tsx` → `GuildHubPage.tsx` | `pages/` |
   | `MemberList.tsx` → `MemberListPage.tsx` | `pages/` |
   | `PlayerProfilePage.tsx`, `CharacterInspectPage.tsx`, `ContactPage.tsx`, `AdminPage.tsx`, `ReffsPage.tsx`, `GuildIntroOverlay.tsx` | `pages/` |
   | `CompetitiveLeaderboard.tsx` → `CompetitiveLeaderboardPage.tsx` | `pages/` |
   | `PpcPage.tsx`, `BossesPage.tsx`, `ScoreCalculatorPage.tsx` | `pages/ppc/` |

3. Update semua import di `App.tsx` dan antar-file yang saling mereferensikan (`grep -rn "from '\./components" src/` untuk daftar lengkap yang harus diubah).
4. Jalankan `npx tsc --noEmit` setelah tiap batch pemindahan untuk menangkap import yang putus lebih awal.

### Fase 4 — Rapikan `services/`, `data/`, dan `supabase/`
1. `mkdir supabase && git mv src/services/supabase_rls_policies.sql supabase/rls_policies.sql`
2. `mkdir src/services/supabase && git mv src/services/supabaseClient.ts src/services/supabase/client.ts`
3. `mkdir src/data/static src/data/fallbacks`
4. Pindah `*_fallback.json` → `src/data/fallbacks/` (boleh rename hilangkan suffix `_fallback` karena sudah jelas dari nama folder, opsional).
5. Rename & pindah `contact_data.ts` → `data/static/contactData.ts`, `ppc_scores.ts` → `data/static/ppcScores.ts`, `reffs_data.ts` → `data/static/reffsData.ts`.
6. Update semua import terkait.
7. Hapus `guild_members_comparison.json` di root; arahkan `scripts/export_guild_members.js` menulis ke `src/data/generated/guild_members_comparison.json`, tambahkan `src/data/generated/` ke `.gitignore` (hapus 2 baris lama yang reference path spesifik).

### Fase 5 — Ekstrak custom hooks dari `App.tsx` (opsional tapi direkomendasikan)
1. Buat `src/hooks/useGuildData.ts` — pindahkan logic `fetch` guild + `loadingGuild` state dari `App.tsx`.
2. Buat `src/hooks/useRouteSync.ts` — pindahkan fungsi `syncRouteFromLocation` & listener terkait.
3. `App.tsx` tinggal memanggil hook-hook ini, jadi lebih pendek dan mudah dibaca.

### Fase 6 — Path alias (opsional, rekomendasi jangka panjang)
1. Tambahkan di `vite.config.ts`:
   ```ts
   resolve: {
     alias: {
       '@': path.resolve(__dirname, 'src'),
     },
   },
   ```
2. Tambahkan `"paths": { "@/*": ["./src/*"] }` di `tsconfig.json` (`baseUrl": "."`).
3. Migrasi bertahap import terdalam (`../../services/...`) ke `@/services/...` — tidak wajib sekaligus, bisa jalan bareng saat menyentuh file terkait.

### Fase 7 — Tooling kualitas kode (opsional)
1. Install ESLint + Prettier (`eslint`, `@typescript-eslint/*`, `eslint-plugin-react-hooks`, `prettier`).
2. Tambahkan `.eslintrc.cjs` / `eslint.config.js` dan `.prettierrc`.
3. Ubah script `lint` di `package.json` jadi `eslint src --ext .ts,.tsx` dan tambahkan script `format`.

### Fase 8 — Verifikasi akhir
1. `npm run build` — pastikan sukses tanpa error TypeScript.
2. `npm run dev` — cek manual semua tab/halaman (Hub, Members, Reffs, Leaderboard, PPC, Admin, Contact) masih render & tidak ada broken image/video.
3. `grep -rn "\.\./\.\./\.\." src/` — pastikan tidak ada import relatif yang aneh tertinggal.
4. Cek Network tab di browser — pastikan `logo.png` & `guild-intro.mp4` ter-load dari `/`.
5. Commit & push branch, buka MR/PR untuk review sebelum merge ke `main`.

---

## 4. Konvensi Penamaan (untuk dokumentasi tim / README)

| Jenis file | Konvensi | Contoh |
|---|---|---|
| React component (reusable) | PascalCase | `Navbar.tsx` |
| React page/view | PascalCase + suffix `Page` | `AdminPage.tsx` |
| Hook | camelCase + prefix `use` | `useGuildData.ts` |
| Service/util `.ts` | camelCase | `apiService.ts` |
| Data statis `.ts` | camelCase | `contactData.ts` |
| JSON data | kebab-case atau camelCase, konsisten | `warzone-fallback.json` |
| Folder | lowercase, plural untuk koleksi | `components/`, `pages/`, `hooks/` |

---

## 5. Ringkasan Prioritas

1. 🔴 **Fase 1 (keamanan)** — kerjakan segera, terpisah dari refactor struktur.
2. 🟠 **Fase 2–4** — inti dari "merapikan struktur", dampak langsung terlihat.
3. 🟡 **Fase 5–7** — peningkatan kualitas jangka panjang, bisa dicicil.
4. Fase 8 selalu jadi penutup tiap fase besar (verifikasi build tidak rusak).
