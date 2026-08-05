# Analisis Kode: Dead Code & Inefisiensi — `karuhun-web`

Metode: compile TypeScript dengan `--noUnusedLocals --noUnusedParameters` (defaultnya di-nonaktifkan di `tsconfig.json` kalian, jadi masalah ini selama ini tidak pernah kelihatan), lalu setiap temuan di-cross-check manual pakai `grep` ke seluruh `src/` supaya tidak ada false-positive.

---

## 🔴 1. Kode Mati Signifikan (paling perlu ditindaklanjuti)

### 1.1 Tiga komponen modal — 100% tidak pernah dipakai (~888 baris)

| File | Baris | Status |
|---|---|---|
| `src/components/modals/PlayerDetailModal.tsx` | 240 | Tidak di-*import* di mana pun |
| `src/components/modals/CharacterDetailModal.tsx` | 534 | Tidak di-*import* di mana pun |
| `src/components/modals/GuildRulesModal.tsx` | 114 | Tidak di-*import* di mana pun |

Saya cek `App.tsx` — sekarang aplikasi memakai **full-page view** (`PlayerProfilePage.tsx`, `CharacterInspectPage.tsx`) lewat state `currentViewMode`, bukan modal lagi. Sepertinya dulu desainnya pakai modal, lalu di-migrasi ke halaman penuh, tapi versi modal-nya lupa dihapus. `GuildRulesModal` malah tidak punya pengganti sama sekali — fitur "guild rules" sepertinya sudah tidak ditampilkan di mana pun di UI saat ini.

**Rekomendasi:** hapus ketiga file ini (atau, kalau modal `PlayerDetailModal`/`CharacterDetailModal` memang direncanakan dipakai lagi suatu saat, pindahkan ke luar `src/` — misal folder `_archive/` di luar build — supaya tidak menumpuk di kode aktif).

### 1.2 Tipe & fungsi yang dideklarasikan tapi tidak pernah dipakai

| Nama | Lokasi | Catatan |
|---|---|---|
| `GuildBranch` (interface) | `src/types/index.ts:3` | Duplikat lama dari `GuildBranchConfig` di `services/imageUtils.ts` yang justru dipakai di seluruh app |
| `ScoreRow` (interface) | `src/data/static/ppcScores.ts:4` | Tidak direferensikan di mana pun |
| `getPpcTotalScore` (function) | `src/data/static/ppcScores.ts:577` | Tidak dipanggil di mana pun — fungsi kembarannya, `getPpcStageScore`, yang justru dipakai |

### 1.3 Duplikasi tipe (bukan cuma dead code, tapi juga bug-risk)

`MemberCompetitiveAchievement` **dideklarasikan dua kali**:
- Sebagai `export interface` di `src/types/index.ts:235` → **tidak pernah dipakai**
- Sebagai `interface` lokal di `src/pages/CompetitiveLeaderboardPage.tsx:6` → **ini yang benar-benar dipakai**

Kalau suatu saat field-nya berubah, gampang lupa update salah satunya karena dikira sudah "centralized" di `types/index.ts`, padahal tidak. Sebaiknya hapus versi di `types/index.ts` dan pastikan hanya ada satu sumber definisi (idealnya di-*export* dari `types/index.ts` lalu di-*import* di halaman, bukan sebaliknya).

### 1.4 Environment variable yang tidak dipakai

`VITE_ADMIN_PASSCODE=karuhun2026` ada di `.env.example`, tapi **tidak direferensikan di kode manapun**. Saya cek `AdminPage.tsx` — autentikasi admin sekarang murni pakai Supabase Auth (`supabase.auth.signInWithPassword`), bukan passcode lagi. Variabel ini sisa dari mekanisme lama sebelum migrasi ke Supabase Auth.

**Rekomendasi:** hapus dari `.env.example` dan `.env`.

---

## 🟠 2. Unused Imports & Variables (65 temuan dari `tsc`)

Ini murni "sampah" import — tidak berdampak ke bundle size (dead code icon dari `lucide-react` akan di-*tree-shake* Rollup saat build), tapi mengotori kode dan menyembunyikan import yang benar-benar dipakai. Ringkasan per file (detail lengkap bisa dilihat dengan menjalankan `npx tsc --noEmit --noUnusedLocals --noUnusedParameters`):

| File | Jumlah unused |
|---|---|
| `src/pages/AdminPage.tsx` | 9 (termasuk `GOOGLE_SPREADSHEET_PPC_URL`, `loading`, `descTab` — state yang dideklarasikan tapi tak pernah dibaca) |
| `src/pages/ppc/ScoreCalculatorPage.tsx` | 8 (termasuk `useEffect` di-*import* tapi tidak dipakai) |
| `src/pages/PlayerProfilePage.tsx` | 5 icon |
| `src/pages/CharacterInspectPage.tsx` | 7 (6 icon + variabel `suits`) |
| `src/pages/CompetitiveLeaderboardPage.tsx` | 4 |
| `src/pages/GuildHubPage.tsx` | 4 (termasuk `totalContrib` — dihitung tapi tak pernah ditampilkan) |
| `src/pages/MemberListPage.tsx` | 4 (termasuk prop `guildInfo` yang diterima tapi tak dipakai) |
| `src/pages/ppc/BossesPage.tsx` | 7 (termasuk prop `onOpenCalculator` yang diterima tapi tak dipakai — cek apakah tombol kalkulator di halaman ini benar-benar berfungsi) |
| `src/components/common/Navbar.tsx` | 7 (termasuk prop `onReplayIntro` — cek apakah tombol "replay intro" masih berfungsi) |
| `src/App.tsx` | 2 (`React` import default tidak perlu lagi di React 17+ JSX transform, `setActiveBossSlug` di-set tapi state-nya tak pernah dibaca) |
| Lainnya | 8 tersebar |

**Yang perlu perhatian ekstra** (bukan sekadar icon nganggur, tapi indikasi *bug* potensial):
- `onReplayIntro` (Navbar) dan `onOpenCalculator` (BossesPage) adalah **props**, bukan cuma import. Kalau prop diterima tapi tidak pernah dipanggil di dalam komponen, kemungkinan ada tombol/aksi di UI yang terlihat tapi **tidak melakukan apa-apa**. Ini layak dicek manual di browser.
- `setActiveBossSlug` di `App.tsx` — ada state untuk boss slug yang di-*set* tapi tidak pernah dibaca ulang; kemungkinan sisa dari flow deep-link yang belum selesai diimplementasikan.

**Rekomendasi:** aktifkan `"noUnusedLocals": true` dan `"noUnusedParameters": true` di `tsconfig.json` supaya masalah seperti ini tertangkap otomatis tiap build ke depannya, bukan menumpuk lagi.

---

## 🟡 3. Kode Tidak Efisien

### 3.1 Fetch sekuensial padahal bisa paralel

Di `src/services/recapService.ts` (`fetchAllGuildMembersSnapshot`) dan `scripts/export_guild_members.js` (`main`), fetch ke 4 guild dilakukan **satu-satu di dalam `for...of` dengan `await`**:

```ts
for (const branch of GUILD_BRANCHES) {
  const res = await getGuildData(branch.server, branch.id);
  ...
}
```

Karena masing-masing guild independen (tidak saling bergantung), ini bisa **4x lebih cepat** kalau diparalelkan:

```ts
const results = await Promise.allSettled(
  GUILD_BRANCHES.map(branch => getGuildData(branch.server, branch.id))
);
```

Ini terjadi di 2 tempat terpisah (frontend `recapService.ts` & script Node `export_guild_members.js`) — logic yang sama, sebaiknya kalau diperbaiki, diperbaiki di keduanya.

### 3.2 Data guild di-hardcode duplikat di 2 tempat

Daftar 4 guild (id, server, nama) ada persis sama di:
- `src/services/imageUtils.ts` → `GUILD_BRANCHES` (dipakai di seluruh frontend)
- `scripts/export_guild_members.js` → `GUILDS` (array terpisah, hardcoded ulang)

Kalau ada guild baru ditambah/dihapus/ganti nama, harus diedit manual di 2 file berbeda — rawan lupa salah satu. Sebaiknya script Node mengimpor dari satu sumber data yang sama (atau taruh di file JSON/TS bersama yang di-*share* keduanya).

### 3.3 Script generator menulis output identik ke 2 folder

`scripts/export_guild_members.js` menulis file **yang sama persis** ke `src/data/generated/guild_members_comparison.json` **dan** `src/data/fallbacks/guild_members_comparison.json`. Ini membuat pemisahan folder yang baru dirapikan (`generated/` = output sementara vs `fallbacks/` = data statis offline) jadi tidak bermakna lagi — keduanya selalu identik setiap script dijalankan. Kalau memang fallback-nya memang dimaksudkan untuk selalu "segar", cukup simpan di satu lokasi saja dan biarkan kode yang butuh fallback membaca dari sana; tidak perlu file duplikat.

### 3.4 `'any'` dipakai 45 kali — mengurangi manfaat TypeScript

Konsentrasi terbesar di:
- `CharacterInspectPage.tsx` — 13 kali
- `CompetitiveLeaderboardPage.tsx` — 7 kali
- `data/static/reffsData.ts` — 6 kali

Ini bukan "salah", tapi tiap `any` berarti TypeScript berhenti mengecek tipe di titik itu — jadi manfaat utama pakai TypeScript (menangkap bug saat compile) hilang persis di bagian-bagian yang paling kompleks (character inspect & leaderboard adalah 2 halaman terpanjang di codebase ini). Rekomendasi: prioritaskan definisikan tipe yang benar untuk 2 file ini dulu, sisanya bisa dicicil.

---

## 🟢 4. `console.log` Debug yang Tertinggal di Kode Produksi

5 baris `console.log` (bukan `console.error`/`console.warn` untuk error handling — ini murni debug log) masih ada:

- `src/services/recapService.ts:374`
- `src/data/static/reffsData.ts:319, 329, 382, 411`

Semuanya berisi log seperti `[Supabase Debug] Sending payload...` dan `[Supabase Success] DIRECTLY SAVED...` — kelihatan seperti log yang ditambahkan saat debugging integrasi Supabase dan lupa dihapus. Ini akan muncul di console browser semua pengunjung situs (termasuk payload data yang dikirim), bukan cuma waktu development.

**Rekomendasi:** hapus, atau ganti dengan util `debugLog()` yang otomatis no-op di production build (`if (import.meta.env.DEV) console.log(...)`).

---

## 🔴 5. Catatan Keamanan (di luar scope "dead code", tapi krusial)

Ditemukan **API key `HUAXU_API_KEY` hardcoded sebagai fallback literal** di 2 tempat:

- `src/services/apiService.ts:16` ⚠️ **ini kode client-side/browser**
- `scripts/export_guild_members.js:9` (kode server-side/build-time, risikonya lebih rendah)

Yang di `apiService.ts` lebih serius: karena env var `VITE_HUAXU_API_KEY` di-*inline* langsung ke bundle JavaScript oleh Vite (semua prefix `VITE_` otomatis diekspos ke browser), key ini **selalu terlihat oleh siapa pun** yang membuka DevTools → Network/Sources, terlepas dari ada-tidaknya fallback hardcoded. Fallback literalnya sendiri memperparah karena key tetap "hidup" walau `.env` di server produksi lupa di-set.

Solusi yang tepat bukan sekadar hapus fallback-nya, tapi secara arsitektur: **jangan panggil API pihak ketiga yang butuh secret key langsung dari browser**. Idealnya request ke Huaxu API di-proxy lewat Supabase Edge Function (kalian sudah pakai Supabase), supaya key hanya hidup di server, bukan di bundle client.

---

## Ringkasan Prioritas

1. 🔴 Hapus 3 modal dead code (`PlayerDetailModal`, `CharacterDetailModal`, `GuildRulesModal`) — ~888 baris tak terpakai.
2. 🔴 Cek `onReplayIntro` (Navbar) & `onOpenCalculator` (BossesPage) — kemungkinan tombol UI yang tidak berfungsi.
3. 🔴 Tangani API key yang bocor ke client bundle di `apiService.ts` (idealnya lewat proxy backend).
4. 🟠 Hapus interface/fungsi dead (`GuildBranch`, `ScoreRow`, `getPpcTotalScore`) & duplikasi tipe `MemberCompetitiveAchievement`.
5. 🟠 Aktifkan `noUnusedLocals`/`noUnusedParameters` di `tsconfig.json` supaya 65 unused import/variable tidak menumpuk lagi.
6. 🟡 Paralelkan fetch 4-guild dengan `Promise.allSettled` (2x tempat).
7. 🟡 Satukan sumber data `GUILD_BRANCHES`/`GUILDS`, dan sederhanakan output script generator (jangan tulis ke 2 folder identik).
8. 🟢 Hapus 5 `console.log` debug leftover.
9. 🟢 Hapus env var `VITE_ADMIN_PASSCODE` yang sudah tidak dipakai.
