# Multi-Tenant White-Label Branding System

A complete white-label branding system that allows deploying the same app for multiple organizations on different domains, each with its own branding, colors, logos, and hero backgrounds — all managed via an admin UI. Same database, same users, same scrims — only the skin changes.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Backend: Model, API & Routes](#2-backend-model-api--routes)
3. [Frontend: Theme Factory](#3-frontend-theme-factory)
4. [Frontend: BrandingProvider & useBranding](#4-frontend-brandingprovider--usebranding)
5. [Refactored Components](#5-refactored-components)
6. [Admin Branding Config UI](#6-admin-branding-config-ui)
7. [Hero Background System](#7-hero-background-system)
8. [Dynamic Favicon & Meta Tags](#8-dynamic-favicon--meta-tags)
9. [Dynamic Button Contrast](#9-dynamic-button-contrast)
10. [Dynamic CORS](#10-dynamic-cors)
11. [Database Seeding](#11-database-seeding)
12. [API Reference](#12-api-reference)
13. [File Manifest](#13-file-manifest)

---

## 1. Architecture Overview

The system uses a **Client-Side Fetch with Loading Gate** approach:

```
Browser loads app
       ↓
BrandingProvider mounts
       ↓
GET /api/branding?hostname=reluminate.gg
       ↓
Server looks up BrandConfig by domain
       ↓
Returns config (colors, branding, social links)
       ↓
createBrandTheme(config.colors) generates MUI theme
       ↓
Updates favicon, apple-touch-icon, og:image, manifest
       ↓
Renders app with <ThemeProvider> + <BrandingContext>
```

**Key Concepts:**
- **Same database, same users, same scrims** — only the visual skin changes per domain
- **One primary color** — light/dark variants are auto-derived; all rgba/alpha values computed at runtime
- **Fallback to defaults** — if API is down or no config matches, the app renders with Reluminate defaults
- **In-memory cache** — branding API responses are cached server-side for 5 minutes

---

## 2. Backend: Model, API & Routes

### MongoDB Schema

**File:** `models/brandConfig.model.js` *(new)*

```js
{
  name: String,              // "Reluminate" (internal name)
  slug: String,              // "reluminate" (unique index)
  domains: [String],         // ["reluminate.gg", "www.reluminate.gg", "localhost"]
  isDefault: Boolean,        // true = fallback when no domain matches
  branding: {
    brandName: String,       // "RELUMINATE.GG"
    tagline: String,         // "Lighting up the rift"
    logoUrl: String,         // Path or URL to logo
    faviconUrl: String,      // Path or URL to favicon
    heroBackgroundUrl: String // Key from HERO_BACKGROUNDS map (e.g. "reluminate_thresh")
  },
  colors: {
    primaryMain: String,     // "#2196F3" - the ONE color admin picks
    primaryLight: String,    // Optional override (auto-derived if empty)
    primaryDark: String,     // Optional override (auto-derived if empty)
    backgroundDefault: String, // "#0a0e1a"
    backgroundPaper: String    // "#121826"
  },
  socialLinks: {
    discord: String,
    twitch: String,
    twitter: String
  },
  timestamps: true           // createdAt, updatedAt
}
```

### Controller

**File:** `controllers/branding.controllers.js` *(new)*

Handlers:
- `getBrandingByHostname` — Looks up config by domain, falls back to `isDefault: true`
- `getManifest` — Returns dynamic PWA manifest JSON by hostname
- `getAllBrandConfigs` — Lists all configs (admin only)
- `createBrandConfig` — Creates a new tenant config
- `updateBrandConfig` — Updates existing config, invalidates cache
- `uploadBrandAsset` — Uploads logo/favicon to S3
- `getAllDomains()` — Helper export for dynamic CORS

Caching: In-memory Map with 5-minute TTL. Invalidated on POST/PATCH operations.

### Routes

**File:** `routes/branding.routes.js` *(new)*

---

## 3. Frontend: Theme Factory

**File:** `client/src/appTheme.js` *(modified)*

Converted from a static `export const appTheme = createTheme({...})` to a factory function:

```js
export function createBrandTheme(colors = {}) {
  const primary = colors.primaryMain || '#2196F3';
  const primaryLight = colors.primaryLight || lighten(primary, 0.2);
  const primaryDark = colors.primaryDark || darken(primary, 0.2);
  const primaryContrastText = getContrastText(primary);
  // ... generates full MUI theme
}

// Backward-compatible default
export const appTheme = createBrandTheme();
```

**What Changed:**
- All hardcoded `rgba(33, 150, 243, ...)` replaced with `alpha(primary, opacity)`
- All hardcoded `#2196F3` / `#64B5F6` / `#1976D2` replaced with derived variables
- Dynamic `contrastText` via luminance calculation (fixes white-on-white buttons)
- Background colors (`bgDefault`, `bgPaper`) are configurable

---

## 4. Frontend: BrandingProvider & useBranding

### BrandingProvider

**File:** `client/src/providers/BrandingProvider.jsx` *(new)*

- Wraps the entire app (above `ThemeProvider`) in `client/src/index.js`
- On mount: fetches `GET /api/branding?hostname=${window.location.hostname}`
- While loading: renders a dark loading screen (`#0a0e1a` bg + spinner)
- Once loaded: stores config in `BrandingContext`, creates dynamic MUI theme
- Dynamically updates: `<link rel="icon">`, `<link rel="apple-touch-icon">`, `<meta property="og:image">`, `<link rel="manifest">`

### useBranding Hook

**File:** `client/src/hooks/useBranding.js` *(new)*

```js
const {
  brandName,         // "RELUMINATE.GG"
  tagline,           // "Lighting up the rift"
  logoUrl,           // "/reluminate-logo.png"
  faviconUrl,        // "/reluminate-logo.png"
  heroBackgroundUrl, // "reluminate_thresh" (key for background map)
  socialLinks,       // { discord, twitch, twitter }
  colors,            // { primaryMain, primaryLight, ... }
  _id,               // MongoDB document ID
  slug               // "reluminate"
} = useBranding();
```

---

## 5. Refactored Components

### Brand Text & Logo Replacements

All hardcoded "RELUMINATE.GG" text and `/reluminate-logo.png` paths replaced with `useBranding()`:

| File | What Changed |
|------|-------------|
| `components/shared/Navbar/Navbar.jsx` | Logo src, brand name text |
| `features/landing/components/LandingNavbar.jsx` | Logo src, brand name text |
| `features/landing/components/HeroSection.jsx` | Brand name, tagline, social links, hero background |
| `components/shared/Footer.jsx` | Copyright text uses brandName |
| `hooks/useNotifications.js` | Notification icon from logoUrl |
| `features/auth/screens/SignUp.jsx` | Welcome message uses brandName |
| `App.jsx` | Helmet page title & meta description |
| `features/users/screens/UserProfile.jsx` | Helmet title |
| `screens/Guide.jsx` | Helmet title |
| `features/scrims/screens/ScrimDetail.jsx` | Helmet title |
| `features/admin/screens/AdminDashboard.jsx` | Helmet title, added Branding Config button |

### Hardcoded Color Replacements

All inline color values replaced with theme-aware equivalents:

| Hardcoded Value | Replacement |
|----------------|-------------|
| `'#2196F3'` | `theme.palette.primary.main` |
| `'#64B5F6'` | `theme.palette.primary.light` |
| `'#1976D2'` | `theme.palette.primary.dark` |
| `rgba(33,150,243,0.X)` | `alpha(theme.palette.primary.main, 0.X)` |

Techniques used across ~27 component files:
- `sx` props: callback form `sx={(theme) => ({...})}`
- `styled()` components: theme parameter in callback
- Recharts colors: `useTheme()` hook + local COLORS object

**Files modified:** GlassPanel, GlassInput, NavbarDrawerItems, NavbarDropdowns, FeaturesSection, CTAButton, SocialButton, Scrims, ScrimCreate, ScrimEdit, ScrimSection.styles, ScrimSectionHeader, ScrimSectionExpander, ScrimSectionMiddleAreaBox, ScrimsColumn, CountdownTimer, RefreshScrimsButton, ProfileAccountDetails, UserStatsCharts, ChatBubble

---

## 6. Admin Branding Config UI

Accessible at `/admin/branding` (super-admin only).

### Components

| File | Purpose |
|------|---------|
| `features/admin/components/BrandingConfig.jsx` *(new)* | Main page: tenant selector, create new tenant, layout with form + preview |
| `features/admin/components/BrandingForm.jsx` *(new)* | Form: domains, brand identity, assets, hero bg picker, color picker, social links |
| `features/admin/components/BrandingPreview.jsx` *(new)* | Scaled live preview with fullscreen dialog |

### Layout
- **Left side:** Form with all branding controls
- **Right side:** Live preview that updates instantly as form values change

### Features
- Tenant selector dropdown (fetches all configs from `GET /api/branding/all`)
- "Create New Tenant" flow with name, slug, domains fields
- **Domains field** — comma-separated hostnames, editable for existing tenants too, with helper text explaining hostname matching
- Primary color picker with auto-derived light/dark variants
- "Advanced Color Overrides" accordion for fine-tuning
- Logo & favicon upload (FileReader + S3)
- Hero background picker from existing game assets (7 options)
- Social links (Discord, Twitch, Twitter)
- Save / Reset buttons
- **Fullscreen preview dialog** — expand icon opens a Dialog (maxWidth="md") showing the preview at 100% scale; inline preview uses ResizeObserver for proper height scaling

---

## 7. Hero Background System

**File:** `client/src/assets/heroBackgrounds.js` *(new)*

Instead of uploading hero background images, the system uses a map of pre-bundled background images from `client/src/assets/images/backgrounds/`. The branding config stores a **key** (e.g., `"reluminate_thresh"`), and the frontend resolves it to the actual webpack-processed image URL.

### Available Backgrounds

| Key | Label | File |
|-----|-------|------|
| `reluminate_thresh` | Thresh | reluminate_thresh.jpg |
| `bootcamp_dragon` | Bootcamp Dragon | bootcamp_dragon.png |
| `epic_cat` | Epic Cat | epic_cat.jpg |
| `happy_team` | Happy Team | happy_team.jpg |
| `summoners_rift` | Summoner's Rift | summoners_rift.jpg |
| `teemo_sunset` | Teemo Sunset | teemo_sunset.png |
| `vi_background` | Vi | vi_background.gif |

### How It Works

```js
import { resolveHeroBackground } from '@/assets/heroBackgrounds';

// In HeroSection:
const { heroBackgroundUrl } = useBranding(); // returns key like "reluminate_thresh"
const heroBg = resolveHeroBackground(heroBackgroundUrl); // returns webpack URL
<HeroSectionWrapper bgImage={heroBg}>
```

In the admin UI, a visual grid picker shows thumbnail previews of each background option.

---

## 8. Dynamic Favicon & Meta Tags

### index.html (Neutral Defaults)

Ships with neutral defaults that serve as fallbacks during loading:
- `<title>Loading...</title>`
- `<meta name="theme-color" content="#0a0e1a">`
- `<link rel="icon" href="%PUBLIC_URL%/reluminate-logo.png">` (fallback)

### Dynamic Overrides

**BrandingProvider** updates after config loads:
- `<link rel="icon">` → `faviconUrl`
- `<link rel="apple-touch-icon">` → `faviconUrl`
- `<meta property="og:image">` → `faviconUrl`
- `<link rel="manifest">` → `/api/branding/manifest?hostname=...`

**React Helmet** (in App.jsx) sets:
- `<title>` → `brandName`
- `<meta name="description">` → `brandName - tagline`

### Dynamic Manifest

The backend serves `GET /api/branding/manifest?hostname=X` which returns a PWA-compliant manifest JSON with the correct `name`, `short_name`, `icons`, and `theme_color` from the BrandConfig.

---

## 9. Dynamic Button Contrast

**File:** `client/src/appTheme.js`

When a tenant picks a light primary color (e.g., white or yellow), button text automatically switches from white to black using a W3C luminance formula:

```js
function getContrastText(hex) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
```

Applied to both `palette.primary.contrastText` and `palette.secondary.contrastText`. MUI uses this for all `variant="contained"` button text, chip text on primary backgrounds, etc.

---

## 10. Dynamic CORS

**File:** `server.js` *(modified)*

CORS middleware now dynamically checks tenant domains from the database in addition to the static `config/allowed-origins.json` list:

```js
const corsOptions = {
  origin: async function (origin, callback) {
    // 1. Allow requests with no origin (server-to-server, Postman)
    // 2. Allow in development mode
    // 3. Check static allowed-origins.json
    // 4. Check BrandConfig domains from DB (cached)
    const domains = await getAllDomains();
    const originHost = new URL(origin).hostname;
    if (domains.includes(originHost)) return callback(null, true);
    // 5. Reject
  }
};
```

---

## 11. Database Seeding

**File:** `seeds/seedBranding.js` *(new)*

Seeds the default Reluminate.gg config with:
- Domains: `reluminate.gg`, `www.reluminate.gg`, `localhost`
- `isDefault: true` (fallback for unrecognized domains)
- Default blue color scheme (`#2196F3`)
- Default hero background: `reluminate_thresh`
- Social links (Discord, Twitch, Twitter)

### How to Run

```bash
# From project root (requires MONGO_URI in .env)
node seeds/seedBranding.js
```

The script is idempotent — it skips seeding if a config with slug `"reluminate"` already exists.

---

## 12. API Reference

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/branding?hostname=X` | API key | Fetch config by hostname |
| GET | `/api/branding/manifest?hostname=X` | Public | Dynamic PWA manifest |
| GET | `/api/branding/all` | Super-admin | List all tenant configs |
| POST | `/api/branding` | Super-admin | Create new tenant config |
| PATCH | `/api/branding/:id` | Super-admin | Update config |
| POST | `/api/branding/upload-asset` | Super-admin | Upload logo/favicon to S3 |

### Example Response: GET /api/branding?hostname=reluminate.gg

```json
{
  "_id": "...",
  "name": "Reluminate",
  "slug": "reluminate",
  "domains": ["reluminate.gg", "www.reluminate.gg", "localhost"],
  "isDefault": true,
  "branding": {
    "brandName": "RELUMINATE.GG",
    "tagline": "Lighting up the rift",
    "logoUrl": "/reluminate-logo.png",
    "faviconUrl": "/reluminate-logo.png",
    "heroBackgroundUrl": "reluminate_thresh"
  },
  "colors": {
    "primaryMain": "#2196F3",
    "primaryLight": "#64B5F6",
    "primaryDark": "#1976D2",
    "backgroundDefault": "#0a0e1a",
    "backgroundPaper": "#121826"
  },
  "socialLinks": {
    "discord": "https://discord.com/invite/Fn8d3UAD6y",
    "twitch": "https://www.twitch.tv/reluminategg",
    "twitter": "https://twitter.com/Reluminategg"
  }
}
```

---

## 13. File Manifest

### New Files Created

| File | Purpose |
|------|---------|
| `models/brandConfig.model.js` | Mongoose schema for branding configs |
| `controllers/branding.controllers.js` | API route handlers with caching |
| `routes/branding.routes.js` | Express route definitions |
| `seeds/seedBranding.js` | Database seed for default Reluminate config |
| `client/src/providers/BrandingProvider.jsx` | React context provider with loading gate |
| `client/src/hooks/useBranding.js` | Hook to access branding context |
| `client/src/assets/heroBackgrounds.js` | Map of hero background image imports |
| `client/src/features/admin/components/BrandingConfig.jsx` | Admin branding config page |
| `client/src/features/admin/components/BrandingForm.jsx` | Branding form with all inputs |
| `client/src/features/admin/components/BrandingPreview.jsx` | Live branding preview panel |

### Modified Files

| File | Changes |
|------|---------|
| `server.js` | Dynamic CORS, branding routes registration |
| `client/src/appTheme.js` | Theme factory, dynamic contrastText |
| `client/src/index.js` | Wrapped app in BrandingProvider |
| `client/src/App.jsx` | Dynamic Helmet title/description |
| `client/src/navigation/AppRouter.jsx` | Added /admin/branding route |
| `client/public/index.html` | Neutral defaults for title/description |
| + ~27 component files | Color/brand refactoring (see Section 5) |
