# edgar.

Personal portfolio website of Edgar ("Raged") — informatics student building things for the web.

## Overview

A single-page interactive portfolio built with Next.js, TypeScript, Tailwind CSS, and Motion. Beyond project showcases and case studies, it includes a few interactive experiments:

- **Pixel Dot Matrix & Rope Lamp Toggle** — interactive hero dot-grid and a physics-based pull-cord light/dark mode switch.
- **Off-Screen Polaroids & Projects** — curated project showcase and photo carousel managed via a custom lightweight CMS.
- **Interactive Boarding Pass** — tearable flight stub with a multi-layered cloud transition leading to the typing terminal.
- **Type-O-Matic Terminal (`/typewriter`)** — retro mechanical typewriter typing test with synthesized audio and a live leaderboard.
- **Dino Runner (`/dino`)** — playable dot-matrix endless runner at the bottom of the page.

## Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Motion
- **Audio & Graphics**: Web Audio API, HTML5 Canvas, custom SVG/dot-matrix renderers

## Local Development

```bash
npm install
npm run dev
```

Create a `.env.local` file pointing to the backend API:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Open [http://localhost:3000](http://localhost:3000).
