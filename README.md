# Vancouver Hub

A modular Vancouver city dashboard built with React, TypeScript, Tailwind CSS, Netlify Functions, and multiple municipal data providers.

## Live Site

<https://vancouverhub.netlify.app>

## Features

- **Persistent navigation:** customizable category links, location status, alerts, settings, theme control, and user account
- **Dashboard:** greeting, compact weather, gas prices, events, traffic, and configurable Neighbour Reports
- **Authentication:** sign-in, registration, and guest access; signed-in users receive personalized data and additional features
- **Settings:** location, alert preferences, navigation visibility, dashboard visibility, service-request preferences, and appearance controls
- **Events:** local event discovery, calendars, date-based browsing, nearby-event information, and disabled past dates in the upcoming calendar
- **Environment:** animated current weather conditions, air quality, wildfire information, and Fire Containment Difficulty
- **Traffic:** DriveBC events, Vancouver traffic cameras, and Cascade Gateway border wait times
- **Neighbourhood:** nearby Vancouver 311 service requests with category filters and seen-report tracking
- **Gas prices:** cheapest available fuel prices within 3 km of the user’s saved location
- **Alerts:** alert preferences, alert evaluation, and navbar notifications
- **Appearance:** light and dark themes, configurable gradients, and animated card effects

## Categories

- **Local Events:** full page and dashboard section
- **Environment:** full page and dashboard weather section
- **Traffic:** full page and dashboard section
- **Neighbourhood:** full page with a Neighbour Reports dashboard section
- **Gas Prices:** dashboard widget; the `/gas` route currently redirects to the dashboard
- **Housing:** temporarily paused; the route currently redirects to the dashboard
- **Government Programs:** temporarily paused; the route currently redirects to the dashboard

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create the local environment file

#### Windows PowerShell

```powershell
Copy-Item '.\.env.example' '.\.env'
```

#### macOS or Linux

```bash
cp .env.example .env
```

Open `.env` and supply your development values:

```dotenv
CASCADE_GATEWAY_API_KEY=YOUR_CASCADE_GATEWAY_KEY
VITE_API_BASE_URL=https://around-van-backend.onrender.com
VITE_GOOGLE_PLACES_API_KEY=YOUR_DEVELOPMENT_GOOGLE_KEY
```

Replace the placeholders with your actual development keys.

Never commit `.env`. The repository contains `.env.example` with variable names only.

### 3. Start the complete local application

```bash
npx netlify dev
```

Open:

<http://localhost:8888>

Netlify Dev starts Vite internally on port `5147` and provides:

- the border-wait Netlify Function at `/api/border-waits`;
- redirects defined in `netlify.toml`;
- the traffic-camera proxy at `/proxy/trafficcams/*`;
- SPA route fallback support.

### Frontend-only development

To run only the Vite frontend:

```bash
npm run dev
```

Open:

<http://localhost:5147>

This mode does not run the Netlify Function at `/api/border-waits`.

The Vite development server still provides the local proxies configured in `vite.config.ts`, including the traffic-camera proxy.

Use `npx netlify dev` when testing the complete application.

## Scripts

- `npx netlify dev` - start the complete local environment with Netlify Functions and redirects
- `npm run dev` - start only the Vite frontend on port 5147
- `npm run build` - run TypeScript validation and create the production build
- `npm run lint` - run the project linter
- `npm run preview` -- preview the static production build

## Environment Variables

| Variable | Purpose | Browser-visible |
|---|---|---:|
| `CASCADE_GATEWAY_API_KEY` | Cascade Gateway credential used by the Netlify Function | No |
| `VITE_API_BASE_URL` | Public URL of the Vancouver Hub backend | Yes |
| `VITE_GOOGLE_PLACES_API_KEY` | Google Places browser key | Yes |

`CASCADE_GATEWAY_API_KEY` is a server-only secret.

Never rename it to `VITE_CASCADE_GATEWAY_API_KEY`, because variables beginning with `VITE_` are included in browser code.

The Google browser key should be protected using Google HTTP-referrer and API restrictions.

## API Providers

Provider modules live in `src/lib/api/`.

- `cascadeGateway.ts` - calls the same-origin `/api/border-waits` endpoint
- `vancouverOpenData.ts` - retrieves City of Vancouver Open Data
- `vancouverTrafficCams.ts` - parses Vancouver intersection-camera pages and directional stills
- `open511.ts` - retrieves and locally caches DriveBC/Open511 traffic events
- `googlePlaces.ts` and `placesAutocomplete.ts` - Google place search and autocomplete
- `environment.ts` - environmental data from the Vancouver Hub backend
- `events.ts` - event data from the Vancouver Hub backend
- `gas.ts` - nearby gas-price data from the Vancouver Hub backend
- `serviceRequests.ts` - Vancouver 311 service-request data from the Vancouver Hub backend
- `auth.ts` and `users.ts` - authentication and user data

## Proxy Architecture

### Cascade Gateway

```text
Browser
  → /api/border-waits
  → Netlify Function
  → Cascade Gateway
```

The browser never receives the Cascade Gateway API key. Netlify stores the production key as `CASCADE_GATEWAY_API_KEY`.

### Traffic cameras

During local Vite development:

```text
Browser
  → Vite /proxy/trafficcams/*
  → trafficcams.vancouver.ca
```

During Netlify Dev and production:

```text
Browser
  → Netlify /proxy/trafficcams/*
  → trafficcams.vancouver.ca
```

This same-origin proxy avoids browser CORS restrictions when fetching traffic-camera HTML pages.

### Vancouver Hub backend

```text
Browser
  → around-van-backend.onrender.com/api/*
```

The backend must allow the deployed Netlify origin in its CORS configuration:

```text
https://vancouverhub.netlify.app
```

## Netlify Deployment

The production site is deployed from the GitHub repository.

Netlify uses:

```text
Production branch: main
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

These settings are also defined in `netlify.toml`.

The following variables must be configured in Netlify:

```text
CASCADE_GATEWAY_API_KEY
VITE_API_BASE_URL
VITE_GOOGLE_PLACES_API_KEY
```

Do not commit production secrets to GitHub.

Every push to the production branch triggers a new Netlify deployment.

## Project Structure

```text
vancouverhub/
├── netlify/
│   └── functions/
│       └── border-waits.ts
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── drivebc/
│   │   ├── environment/
│   │   ├── events/
│   │   ├── layout/
│   │   ├── safety/
│   │   ├── settings/
│   │   ├── ui/
│   │   └── weather/
│   ├── constants/
│   ├── context/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   │   └── api/
│   ├── pages/
│   ├── types/
│   └── utils/
├── .env.example
├── netlify.toml
├── package.json
├── tsconfig.json
└── vite.config.ts
```