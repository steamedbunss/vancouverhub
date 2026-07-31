# Vancouver Hub

A modular Vancouver city dashboard built with React, TypeScript, and Tailwind CSS.

## Features

- **Persistent navbar**: logo, customizable category links, location, alerts bell, settings, and user avatar
- **Dashboard**: zigzag layout with all 7 categories, mock data, order driven by user settings
- **Settings**: location, alert preferences, nav visibility toggles, dashboard category toggles
- **Category pages**: placeholder routes for all 7 categories (ready for future data integration)

## Categories

- Local Events
- Environment
- Traffic
- Housing
- Gas Prices
- Gov Programs
- Safety / 311

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

- `npm run dev`: start dev server
- `npm run build`: production build
- `npm run preview`: preview production build

## API providers

Provider modules live in `src/lib/api/` (one file per data source, not per UI section).

- `vancouverOpenData.ts` - City of Vancouver Open Data (traffic camera locations; later closures, amenities, 311)
- `vancouverTrafficCams.ts` - trafficcams.vancouver.ca intersection pages (North/East/South/West stills)

Dev server proxies `/proxy/opendata` and `/proxy/trafficcams` to avoid CORS when scraping camera HTML.

## Project Structure

```
src/
├── components/
│   ├── dashboard/sections/   # One component per category section
│   ├── layout/               # Navbar, alerts, shell
│   ├── settings/             # Settings page modules
│   └── ui/                   # Shared UI primitives
├── constants/                # Category definitions
├── context/                  # User config state
├── data/                     # Mock data (replace with APIs later)
├── lib/                      # Storage helpers
├── pages/                    # Route pages
└── types/                    # TypeScript interfaces
```
