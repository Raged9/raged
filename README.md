# Edgar Portfolio — Planning Docs

Ini adalah kumpulan file `.md` yang jadi "briefing pack" buat Antigravity sebelum mulai coding. Taruh masing-masing file di root repo yang sesuai (bukan digabung jadi satu file besar), karena agent membaca `AGENTS.md` sebagai instruksi kerja dan file lain sebagai referensi/spec yang di-link dari situ.

## Struktur repo (2 repo terpisah)

```
edgar-portfolio-frontend/   → Next.js (App Router), hosting: Vercel
  ├── AGENTS.md
  ├── DESIGN.md
  ├── BOARDING_PASS.md
  └── TYPING_GAME.md

edgar-portfolio-backend/    → Node.js + PostgreSQL API
  └── AGENTS.md
```

Kenapa dipisah repo: biar frontend bisa deploy independen ke Vercel tanpa nunggu backend, dan backend (leaderboard, contact form, CMS-lite) bisa di-deploy ke mana saja (Railway/Render/Fly.io) tanpa ikut proses build Next.js.

## Cara pakai di Antigravity

1. Buat 2 workspace/project terpisah di Antigravity, satu per repo.
2. Di tiap repo, taruh `AGENTS.md` di root — Antigravity (dan agent coding lain seperti Claude Code/Cursor) otomatis membaca ini duluan sebelum menyentuh kode.
3. `DESIGN.md`, `BOARDING_PASS.md`, `TYPING_GAME.md` ditaruh di root repo frontend juga, dan di-reference dari `AGENTS.md` supaya agent tahu harus baca file mana untuk detail tiap bagian.
4. Kerjakan section demi section (Hero → Projects → Boarding Pass → Typing Game → Footer), jangan minta Antigravity generate semuanya sekaligus — hasilnya lebih terarah dan gampang di-review.

## Referensi desain yang dipakai

- **Struktur & vibe halaman**: [thatcreativetayo/tayo](https://github.com/thatcreativetayo/tayo) — Next.js portfolio dengan Hero → Projects (case study per project) → Blog → Contact, dipakai sebagai kerangka information architecture, kontennya diganti total jadi milik Edgar.
- **Komponen boarding pass**: [jal-co/boarding-pass](https://github.com/jal-co/boarding-pass) — komponen React + Motion, tiket yang bisa dirobek (tear) dengan progress 0–1, di-adapt jadi transisi ke section typing game.
- **Font hero**: gaya display besar ala halaman produk Apple (SF Pro Display / system-ui), dipakai untuk headline "hello." menggantikan pola "Hey" yang umum dipakai di portfolio bertema serupa.
