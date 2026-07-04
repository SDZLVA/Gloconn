# Glooconn — Project Overview

## What is Glooconn?

Glooconn is a travel planning web application that helps users discover destinations, plan trips, and manage travel in one place. The product vision is similar in spirit to major travel platforms (e.g. Booking.com) but with its own brand identity, codebase, and feature roadmap.

**Repository:** [github.com/SDZLVA/Gloconn](https://github.com/SDZLVA/Gloconn)  
**Owner:** Shehan De Silva (@SDZLVA)  
**Current version:** 0.1.0 (Week 1 foundation)

---

## Tech stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.2.9 |
| Language | TypeScript | 5.x |
| UI library | React | 19.2.4 |
| Styling | Tailwind CSS | 4.x |
| Linting | ESLint + eslint-config-next | 9.x |
| Font | Geist Sans / Geist Mono (via next/font) | — |

No backend, database, or third-party API integrations are connected yet.

---

## Project structure

```
Gloconn/
├── app/                    # Next.js App Router pages and global styles
│   ├── layout.tsx          # Root layout (wraps all pages in AppShell)
│   ├── page.tsx            # Home page
│   └── globals.css         # Global CSS, brand colors, typography
├── components/
│   ├── home/               # Home page sections (HeroSection)
│   ├── layout/             # Site shell (Navbar, Footer, AppShell)
│   ├── search/             # Search form feature (SearchCard, TravelStyleSelector)
│   └── ui/                 # Generic reusable UI (Button, Card, InputField, FormField)
├── hooks/                  # Custom React hooks (useSearchForm)
├── lib/                    # Non-React helpers (navigation, search, styles, utils)
├── types/                  # Shared TypeScript types
├── docs/                   # Project documentation (this folder)
└── public/                 # Static assets (reserved for future use)
```

---

## Current features (Week 1)

### Layout
- Sticky navigation bar with logo and links (Home, Destinations, My Trips, About)
- Responsive mobile hamburger menu
- Footer with link groups and copyright
- Consistent page width via `PageContainer`

### Home page
- Hero section with headline, subtitle, and centered search card
- Modern travel-themed design (brand blues, soft gradients, rounded cards)

### Search form (UI + client logic, no API)
- Fields: Destination, Departure date, Return date, Budget (optional), Number of travelers, Travel style (Budget / Standard / Luxury)
- React state management via `useSearchForm` hook
- Required-field validation on Search click
- Successful searches log formatted data to the browser console

---

## Pages and routes

| Route | Status | Description |
|-------|--------|-------------|
| `/` | ✅ Live | Home page with hero and search card |
| `/destinations` | ⏳ Planned | Destination browsing (nav link exists, page not built) |
| `/my-trips` | ⏳ Planned | User trip management (nav link exists, page not built) |
| `/about` | ⏳ Planned | About Glooconn (nav link exists, page not built) |

---

## Development commands

```bash
npm run dev      # Start development server → http://localhost:3000
npm run build    # Production build
npm run start    # Run production build locally
npm run lint     # Run ESLint
```

### Windows note
If PowerShell blocks `npm`, use `npm.cmd run dev` or set execution policy:
`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## Coding standards

See `PROJECT_RULES.md` in the project root for AI and developer guidelines. Key principles:

- Small, incremental changes
- TypeScript + Next.js App Router + Tailwind CSS
- Reusable components
- Beginner-friendly explanations
- Commit and push after each completed task

---

## Related documentation

| File | Purpose |
|------|---------|
| [ROADMAP.md](./ROADMAP.md) | Planned features by phase |
| [PROGRESS.md](./PROGRESS.md) | Week-by-week completed work |
| [TODO.md](./TODO.md) | Active and upcoming tasks |
| [DECISIONS.md](./DECISIONS.md) | Architecture and design decisions |
| [AI_HANDOFF.md](./AI_HANDOFF.md) | Context for AI assistants continuing the project |
