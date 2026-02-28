# White-Label Multi-Tenant Branding — Implementation Guide

A step-by-step guide for implementing a domain-based white-label branding system in your own app. One codebase, one database, multiple branded experiences — each served based on the visitor's hostname.

---

## Table of Contents

1. [How It Works](#1-how-it-works)
2. [Backend: Data Model](#2-backend-data-model)
3. [Backend: API Endpoints](#3-backend-api-endpoints)
4. [Backend: Caching](#4-backend-caching)
5. [Backend: Dynamic CORS](#5-backend-dynamic-cors)
6. [Frontend: Theme Factory](#6-frontend-theme-factory)
7. [Frontend: Branding Provider (Loading Gate)](#7-frontend-branding-provider-loading-gate)
8. [Frontend: Consuming Branding Data](#8-frontend-consuming-branding-data)
9. [Frontend: Dynamic Meta Tags](#9-frontend-dynamic-meta-tags)
10. [Frontend: Admin UI](#10-frontend-admin-ui)
11. [Auto Contrast for Buttons](#11-auto-contrast-for-buttons)
12. [Database Seeding](#12-database-seeding)
13. [SQL Alternative](#13-sql-alternative)
14. [Checklist](#14-checklist)

---

## 1. How It Works

```
User visits app.example.com
       ↓
React app loads (shows loading screen)
       ↓
Fetches GET /api/branding?hostname=app.example.com
       ↓
Server matches hostname → returns brand config
       ↓
Frontend creates theme from config colors
       ↓
Updates favicon, meta tags, manifest
       ↓
Renders app wrapped in ThemeProvider + BrandingContext
```

**Core idea:** The database stores a branding config per tenant. Each config has a list of domains. When the frontend loads, it sends its `window.location.hostname` to the API, which looks up the matching config and returns it. The frontend then uses it to build the UI theme and inject brand text/assets.

---

## 2. Backend: Data Model

### MongoDB (Mongoose)

```js
const mongoose = require('mongoose');

const brandConfigSchema = new mongoose.Schema({
  name: { type: String, required: true },         // Internal name: "Acme Corp"
  slug: { type: String, required: true, unique: true }, // URL-safe: "acme-corp"
  domains: [{ type: String }],                     // ["acme.example.com", "www.acme.com"]
  isDefault: { type: Boolean, default: false },    // Fallback if no domain matches

  branding: {
    brandName: { type: String, default: 'My App' },
    tagline: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
  },

  colors: {
    primaryMain: { type: String, default: '#2196F3' },
    primaryLight: { type: String },   // Optional override, auto-derived if empty
    primaryDark: { type: String },    // Optional override, auto-derived if empty
    backgroundDefault: { type: String, default: '#0a0e1a' },
    backgroundPaper: { type: String, default: '#121826' },
  },

  socialLinks: {
    discord: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
}, { timestamps: true });

brandConfigSchema.index({ domains: 1 });
brandConfigSchema.index({ isDefault: 1 });

module.exports = mongoose.model('BrandConfig', brandConfigSchema);
```

### SQL Alternative

See [Section 13](#13-sql-alternative) for PostgreSQL/MySQL schema.

---

## 3. Backend: API Endpoints

### Public: Get branding by hostname

This is the main endpoint your frontend calls on load.

```js
// GET /api/branding?hostname=acme.example.com
async function getBrandingByHostname(req, res) {
  const { hostname } = req.query;
  if (!hostname) return res.status(400).json({ error: 'hostname required' });

  // Check cache first (see Section 4)
  const cached = cache.get(hostname);
  if (cached) return res.json(cached);

  // Look up by domain
  let config = await BrandConfig.findOne({ domains: hostname });

  // Fall back to default
  if (!config) {
    config = await BrandConfig.findOne({ isDefault: true });
  }

  if (!config) return res.status(404).json({ error: 'No branding config found' });

  cache.set(hostname, config);
  res.json(config);
}
```

### Public: Dynamic manifest

Returns a PWA-compliant manifest per tenant:

```js
// GET /api/branding/manifest?hostname=acme.example.com
async function getManifest(req, res) {
  const { hostname } = req.query;
  const config = await findConfigByHostname(hostname); // reuse lookup logic

  res.json({
    short_name: config.branding.brandName,
    name: config.branding.brandName,
    icons: [
      { src: config.branding.faviconUrl, sizes: '192x192', type: 'image/png' },
      { src: config.branding.faviconUrl, sizes: '512x512', type: 'image/png' },
    ],
    start_url: '.',
    display: 'standalone',
    theme_color: config.colors.primaryMain,
    background_color: config.colors.backgroundDefault,
  });
}
```

### Admin: CRUD endpoints

```
GET    /api/branding/all          → List all configs (admin auth required)
POST   /api/branding              → Create new config
PATCH  /api/branding/:id          → Update existing config
POST   /api/branding/upload-asset → Upload logo/favicon (if using S3/cloud storage)
```

Invalidate cache on every POST/PATCH.

### Express routes setup

```js
const router = require('express').Router();
const ctrl = require('./branding.controllers');
const adminAuth = require('./middleware/admin');

// Public
router.get('/branding', ctrl.getBrandingByHostname);
router.get('/branding/manifest', ctrl.getManifest);

// Admin
router.get('/branding/all', adminAuth, ctrl.getAllBrandConfigs);
router.post('/branding', adminAuth, ctrl.createBrandConfig);
router.patch('/branding/:id', adminAuth, ctrl.updateBrandConfig);
router.post('/branding/upload-asset', adminAuth, ctrl.uploadBrandAsset);

module.exports = router;
```

---

## 4. Backend: Caching

Branding configs rarely change, so cache aggressively. A simple in-memory cache with TTL works well:

```js
class SimpleCache {
  constructor(ttlMs = 5 * 60 * 1000) { // 5 minutes
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    this.cache.set(key, { value, ts: Date.now() });
  }

  invalidate() {
    this.cache.clear();
  }
}

const brandingCache = new SimpleCache();

// Call brandingCache.invalidate() in your POST/PATCH handlers
```

For multi-server deployments, use Redis instead of in-memory.

---

## 5. Backend: Dynamic CORS

When tenants have custom domains, those domains need to be allowed by CORS. Extend your CORS config to check the database:

```js
const cors = require('cors');

const corsOptions = {
  origin: async function (origin, callback) {
    // Allow server-to-server requests (no origin header)
    if (!origin) return callback(null, true);

    // Allow in development
    if (process.env.NODE_ENV === 'development') return callback(null, true);

    // Check static allowlist
    const staticOrigins = ['https://myapp.com', 'https://www.myapp.com'];
    if (staticOrigins.includes(origin)) return callback(null, true);

    // Check tenant domains from DB
    try {
      const configs = await BrandConfig.find({}, { domains: 1 }).lean();
      const allDomains = configs.flatMap((c) => c.domains);
      const originHost = new URL(origin).hostname;
      if (allDomains.includes(originHost)) return callback(null, true);
    } catch (err) {
      console.error('CORS lookup error:', err);
    }

    callback(new Error('Not allowed by CORS'));
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

**Tip:** Cache the domains list (same cache class from Section 4) so you're not hitting the DB on every request.

---

## 6. Frontend: Theme Factory

Convert your static theme into a factory function. This example uses MUI, but the pattern applies to any CSS-in-JS or CSS variable system.

### MUI Example

```js
import { createTheme, alpha, lighten, darken } from '@mui/material/styles';

// Luminance-based contrast text (see Section 11)
function getContrastText(hex) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function createBrandTheme(colors = {}) {
  const primary = colors.primaryMain || '#2196F3';
  const primaryLight = colors.primaryLight || lighten(primary, 0.2);
  const primaryDark = colors.primaryDark || darken(primary, 0.2);
  const bgDefault = colors.backgroundDefault || '#0a0e1a';
  const bgPaper = colors.backgroundPaper || '#121826';

  return createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: primary,
        light: primaryLight,
        dark: primaryDark,
        contrastText: getContrastText(primary),
      },
      background: { default: bgDefault, paper: bgPaper },
    },
    components: {
      // Replace ALL hardcoded color values with alpha(primary, ...) etc.
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            background: `linear-gradient(135deg, ${primary}, ${primaryDark})`,
          },
        },
      },
      // ... other component overrides
    },
  });
}

// Backward-compatible default export for incremental migration
export const appTheme = createBrandTheme();
```

### CSS Variables Alternative (non-MUI)

If you're not using MUI, set CSS custom properties instead:

```js
function applyBrandTheme(colors) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', colors.primaryMain);
  root.style.setProperty('--color-primary-light', colors.primaryLight);
  root.style.setProperty('--color-primary-dark', colors.primaryDark);
  root.style.setProperty('--color-bg', colors.backgroundDefault);
  root.style.setProperty('--color-surface', colors.backgroundPaper);
}
```

Then use `var(--color-primary)` in your CSS. Same principle.

### Key Rule

**Never hardcode color hex values in component files.** Always reference the theme. For MUI:
- In `sx` props: `sx={(theme) => ({ color: theme.palette.primary.main })}`
- In `styled()`: theme is passed as a parameter
- In other contexts: `useTheme()` hook

---

## 7. Frontend: Branding Provider (Loading Gate)

The provider fetches branding config on mount, blocks rendering until loaded, then provides both the MUI theme and branding data to the entire app.

```jsx
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createBrandTheme } from './appTheme';
import api from './services/api';

export const BrandingContext = createContext(null);

const DEFAULTS = {
  brandName: 'My App',
  tagline: '',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.png',
};

export default function BrandingProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBranding() {
      try {
        const { data } = await api.get(
          `/branding?hostname=${window.location.hostname}`
        );
        setConfig(data);

        // Update favicon
        const iconLink = document.querySelector("link[rel='icon']");
        if (iconLink && data.branding?.faviconUrl) {
          iconLink.href = data.branding.faviconUrl;
        }

        // Update apple-touch-icon
        const appleIcon = document.querySelector("link[rel='apple-touch-icon']");
        if (appleIcon && data.branding?.faviconUrl) {
          appleIcon.href = data.branding.faviconUrl;
        }

        // Update og:image
        const ogImage = document.querySelector("meta[property='og:image']");
        if (ogImage && data.branding?.faviconUrl) {
          ogImage.setAttribute('content', data.branding.faviconUrl);
        }

        // Update manifest link to dynamic endpoint
        const manifestLink = document.querySelector("link[rel='manifest']");
        if (manifestLink) {
          manifestLink.href = `/api/branding/manifest?hostname=${window.location.hostname}`;
        }
      } catch (err) {
        console.error('Failed to fetch branding:', err);
        // App still renders with defaults
      } finally {
        setLoading(false);
      }
    }
    fetchBranding();
  }, []);

  const theme = useMemo(
    () => createBrandTheme(config?.colors || {}),
    [config]
  );

  const branding = useMemo(() => ({
    brandName: config?.branding?.brandName || DEFAULTS.brandName,
    tagline: config?.branding?.tagline || DEFAULTS.tagline,
    logoUrl: config?.branding?.logoUrl || DEFAULTS.logoUrl,
    faviconUrl: config?.branding?.faviconUrl || DEFAULTS.faviconUrl,
    socialLinks: config?.socialLinks || {},
    colors: config?.colors || {},
    _id: config?._id,
    slug: config?.slug,
  }), [config]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0a0e1a', // dark fallback
      }}>
        {/* Your spinner/loading component */}
      </div>
    );
  }

  return (
    <BrandingContext.Provider value={branding}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </BrandingContext.Provider>
  );
}
```

### Wire it up in index.js

```jsx
// Before:
<ThemeProvider theme={appTheme}>
  <App />
</ThemeProvider>

// After:
<BrandingProvider>
  <App />
</BrandingProvider>
```

---

## 8. Frontend: Consuming Branding Data

### useBranding hook

```js
import { useContext } from 'react';
import { BrandingContext } from '../providers/BrandingProvider';

export default function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be inside BrandingProvider');
  return ctx;
}
```

### Usage in components

```jsx
function Navbar() {
  const { brandName, logoUrl } = useBranding();

  return (
    <AppBar>
      <Toolbar>
        <img src={logoUrl} alt="logo" />
        <Typography>{brandName}</Typography>
      </Toolbar>
    </AppBar>
  );
}
```

### What to replace

Search your entire frontend for:
- Hardcoded brand names (e.g., `"My App"`, `"ACME"`)
- Hardcoded logo paths (e.g., `"/logo.png"`)
- Hardcoded social links
- Hardcoded color hex values (`#2196F3`, `rgba(33,150,243,...)`)

Replace them all with `useBranding()` values or theme references.

---

## 9. Frontend: Dynamic Meta Tags

### index.html — neutral defaults

```html
<head>
  <link rel="icon" href="%PUBLIC_URL%/default-favicon.png" />
  <meta name="theme-color" content="#0a0e1a" />
  <meta name="description" content="Loading..." />
  <meta property="og:image" content="%PUBLIC_URL%/default-favicon.png" />
  <link rel="apple-touch-icon" href="%PUBLIC_URL%/default-favicon.png" />
  <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
  <title>Loading...</title>
</head>
```

### React Helmet for dynamic title/description

```jsx
import { Helmet } from 'react-helmet';
import useBranding from './hooks/useBranding';

function App() {
  const { brandName, tagline } = useBranding();
  return (
    <>
      <Helmet>
        <title>{brandName}</title>
        <meta name="description" content={`${brandName} - ${tagline}`} />
      </Helmet>
      {/* rest of app */}
    </>
  );
}
```

### Important: og:image and link previews

Client-side JavaScript updates to `<meta property="og:image">` will **not** work for social media link previews (Discord, Twitter, Slack, etc.). These crawlers don't execute JavaScript — they read the raw HTML.

**Solutions for proper og:image per tenant:**

1. **Server-side rendering (SSR)** — Use Next.js, Remix, or similar to render `<head>` tags server-side based on the hostname
2. **Edge middleware / CDN worker** — Cloudflare Workers, Vercel Edge Functions, or AWS Lambda@Edge can intercept the HTML response and inject the correct `<meta>` tags based on the request hostname before it reaches the client
3. **Prerender service** — Use a service like prerender.io that serves pre-rendered HTML to bot user agents
4. **Reverse proxy injection** — Nginx/Apache can inject or rewrite meta tags based on the `Host` header

The simplest for most setups is an edge function:

```js
// Example: Cloudflare Worker / Vercel Edge Middleware
export default async function middleware(request) {
  const response = await fetch(request);
  const hostname = new URL(request.url).hostname;

  // Fetch branding from your API
  const branding = await fetch(`https://api.yourapp.com/branding?hostname=${hostname}`);
  const config = await branding.json();

  // Rewrite HTML
  return new HTMLRewriter()
    .on('meta[property="og:image"]', {
      element(el) { el.setAttribute('content', config.branding.logoUrl); }
    })
    .on('meta[property="og:title"]', {
      element(el) { el.setAttribute('content', config.branding.brandName); }
    })
    .on('title', {
      element(el) { el.setInnerContent(config.branding.brandName); }
    })
    .transform(response);
}
```

---

## 10. Frontend: Admin UI

Build an admin page where super-admins can manage branding per tenant. Key components:

### Tenant Selector
- Dropdown listing all tenant configs (from `GET /api/branding/all`)
- "Create New" option that shows name/slug/domains fields

### Branding Form
- **Domains** — comma-separated hostnames (editable for existing tenants too)
- **Brand Identity** — brand name, tagline
- **Assets** — logo upload, favicon upload
- **Colors** — primary color picker (one color, light/dark auto-derived), advanced overrides accordion
- **Social Links** — Discord, Twitter, etc.

### Live Preview
- Scaled-down preview of your navbar + hero section
- Wrap in its own `<ThemeProvider theme={createBrandTheme(formValues.colors)}>` for instant feedback
- Add a fullscreen dialog for a 100% scale view

### Save flow
```
Form values → PATCH /api/branding/:id → cache invalidated → response updates form
```

---

## 11. Auto Contrast for Buttons

When the admin picks a very light primary color (white, yellow, etc.), button text needs to switch from white to black automatically.

```js
function getContrastText(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  // W3C relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
```

Use this when building your theme:

```js
palette: {
  primary: {
    main: primary,
    contrastText: getContrastText(primary),  // auto black or white
  }
}
```

---

## 12. Database Seeding

Create a seed script for your default tenant so the app works immediately:

```js
// seeds/seedBranding.js
require('dotenv').config();
const mongoose = require('mongoose');
const BrandConfig = require('../models/brandConfig.model');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await BrandConfig.findOne({ slug: 'my-app' });
  if (existing) {
    console.log('Default config exists, skipping.');
    return mongoose.disconnect();
  }

  await BrandConfig.create({
    name: 'My App',
    slug: 'my-app',
    domains: ['myapp.com', 'www.myapp.com', 'localhost'],
    isDefault: true,
    branding: {
      brandName: 'MY APP',
      tagline: 'Your tagline here',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.png',
    },
    colors: {
      primaryMain: '#2196F3',
      backgroundDefault: '#0a0e1a',
      backgroundPaper: '#121826',
    },
    socialLinks: {
      discord: 'https://discord.gg/your-server',
    },
  });

  console.log('Default brand config seeded.');
  await mongoose.disconnect();
}

seed().catch(console.error);
```

Run with `node seeds/seedBranding.js`.

---

## 13. SQL Alternative

If you're using PostgreSQL, MySQL, or another SQL database instead of MongoDB, here's the equivalent schema and queries.

### PostgreSQL Schema

```sql
CREATE TABLE brand_configs (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  is_default    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),

  -- Branding
  brand_name    VARCHAR(255) DEFAULT 'My App',
  tagline       VARCHAR(500) DEFAULT '',
  logo_url      VARCHAR(1000) DEFAULT '',
  favicon_url   VARCHAR(1000) DEFAULT '',

  -- Colors
  primary_main        VARCHAR(7) DEFAULT '#2196F3',
  primary_light       VARCHAR(7),
  primary_dark        VARCHAR(7),
  background_default  VARCHAR(7) DEFAULT '#0a0e1a',
  background_paper    VARCHAR(7) DEFAULT '#121826',

  -- Social
  social_discord  VARCHAR(500) DEFAULT '',
  social_twitter  VARCHAR(500) DEFAULT '',
  social_twitch   VARCHAR(500) DEFAULT ''
);

-- Domains are 1:many, so use a separate table
CREATE TABLE brand_config_domains (
  id              SERIAL PRIMARY KEY,
  brand_config_id INTEGER NOT NULL REFERENCES brand_configs(id) ON DELETE CASCADE,
  domain          VARCHAR(255) NOT NULL
);

CREATE INDEX idx_domains_domain ON brand_config_domains(domain);
CREATE INDEX idx_brand_configs_is_default ON brand_configs(is_default) WHERE is_default = TRUE;
```

### MySQL Schema

```sql
CREATE TABLE brand_configs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  is_default    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  brand_name    VARCHAR(255) DEFAULT 'My App',
  tagline       VARCHAR(500) DEFAULT '',
  logo_url      VARCHAR(1000) DEFAULT '',
  favicon_url   VARCHAR(1000) DEFAULT '',

  primary_main        VARCHAR(7) DEFAULT '#2196F3',
  primary_light       VARCHAR(7) NULL,
  primary_dark        VARCHAR(7) NULL,
  background_default  VARCHAR(7) DEFAULT '#0a0e1a',
  background_paper    VARCHAR(7) DEFAULT '#121826',

  social_discord  VARCHAR(500) DEFAULT '',
  social_twitter  VARCHAR(500) DEFAULT '',
  social_twitch   VARCHAR(500) DEFAULT ''
);

CREATE TABLE brand_config_domains (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  brand_config_id INT NOT NULL,
  domain          VARCHAR(255) NOT NULL,
  FOREIGN KEY (brand_config_id) REFERENCES brand_configs(id) ON DELETE CASCADE,
  INDEX idx_domain (domain)
);
```

### Query: Lookup by hostname

```sql
-- PostgreSQL / MySQL
SELECT bc.*
FROM brand_configs bc
JOIN brand_config_domains bcd ON bc.id = bcd.brand_config_id
WHERE bcd.domain = $1   -- or ? for MySQL
LIMIT 1;

-- Fallback to default
SELECT * FROM brand_configs WHERE is_default = TRUE LIMIT 1;
```

### Query: Get all domains (for CORS)

```sql
SELECT DISTINCT domain FROM brand_config_domains;
```

### Query: Seed default config

```sql
INSERT INTO brand_configs (name, slug, is_default, brand_name, tagline, primary_main)
VALUES ('My App', 'my-app', TRUE, 'MY APP', 'Your tagline', '#2196F3');

-- Get the inserted ID, then:
INSERT INTO brand_config_domains (brand_config_id, domain) VALUES
  (1, 'myapp.com'),
  (1, 'www.myapp.com'),
  (1, 'localhost');
```

### Express controller with SQL (using `pg` or `knex`)

```js
// Using pg (node-postgres)
async function getBrandingByHostname(req, res) {
  const { hostname } = req.query;
  if (!hostname) return res.status(400).json({ error: 'hostname required' });

  // Check cache
  const cached = cache.get(hostname);
  if (cached) return res.json(cached);

  // Lookup by domain
  let result = await pool.query(`
    SELECT bc.*, array_agg(bcd.domain) as domains
    FROM brand_configs bc
    JOIN brand_config_domains bcd ON bc.id = bcd.brand_config_id
    WHERE bcd.domain = $1
    GROUP BY bc.id
    LIMIT 1
  `, [hostname]);

  // Fallback to default
  if (result.rows.length === 0) {
    result = await pool.query(`
      SELECT bc.*, array_agg(bcd.domain) as domains
      FROM brand_configs bc
      JOIN brand_config_domains bcd ON bc.id = bcd.brand_config_id
      WHERE bc.is_default = TRUE
      GROUP BY bc.id
      LIMIT 1
    `);
  }

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'No config found' });
  }

  // Reshape flat row into nested structure for frontend compatibility
  const row = result.rows[0];
  const config = {
    _id: row.id,
    name: row.name,
    slug: row.slug,
    domains: row.domains,
    isDefault: row.is_default,
    branding: {
      brandName: row.brand_name,
      tagline: row.tagline,
      logoUrl: row.logo_url,
      faviconUrl: row.favicon_url,
    },
    colors: {
      primaryMain: row.primary_main,
      primaryLight: row.primary_light,
      primaryDark: row.primary_dark,
      backgroundDefault: row.background_default,
      backgroundPaper: row.background_paper,
    },
    socialLinks: {
      discord: row.social_discord,
      twitter: row.social_twitter,
      twitch: row.social_twitch,
    },
  };

  cache.set(hostname, config);
  res.json(config);
}
```

### ORM example (Prisma)

```prisma
model BrandConfig {
  id             Int       @id @default(autoincrement())
  name           String
  slug           String    @unique
  isDefault      Boolean   @default(false)
  domains        BrandConfigDomain[]

  brandName      String    @default("My App")
  tagline        String    @default("")
  logoUrl        String    @default("")
  faviconUrl     String    @default("")

  primaryMain       String  @default("#2196F3")
  primaryLight      String?
  primaryDark       String?
  backgroundDefault String  @default("#0a0e1a")
  backgroundPaper   String  @default("#121826")

  socialDiscord  String    @default("")
  socialTwitter  String    @default("")

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model BrandConfigDomain {
  id             Int          @id @default(autoincrement())
  domain         String
  brandConfig    BrandConfig  @relation(fields: [brandConfigId], references: [id], onDelete: Cascade)
  brandConfigId  Int

  @@index([domain])
}
```

---

## 14. Checklist

### Backend
- [ ] Create brand config model/table with domains, colors, branding fields
- [ ] Create `GET /api/branding?hostname=` endpoint with domain lookup + default fallback
- [ ] Create `GET /api/branding/manifest` for dynamic PWA manifest
- [ ] Create admin CRUD endpoints (list all, create, update)
- [ ] Add in-memory or Redis cache with TTL (5 min) + invalidation on writes
- [ ] Update CORS to dynamically allow tenant domains
- [ ] Create seed script for default tenant
- [ ] (Optional) Asset upload endpoint for logos/favicons

### Frontend
- [ ] Convert static theme to factory function (`createBrandTheme(colors)`)
- [ ] Add `getContrastText()` for dynamic button text color
- [ ] Replace ALL hardcoded color hex values with theme references
- [ ] Create `BrandingProvider` with loading gate
- [ ] Create `useBranding()` hook
- [ ] Wrap app in `BrandingProvider` (replaces direct `ThemeProvider`)
- [ ] Replace all hardcoded brand names/logos with `useBranding()` values
- [ ] Neutralize `index.html` defaults (title, favicon, description)
- [ ] Use React Helmet for dynamic title/description
- [ ] Update favicon, apple-touch-icon, og:image in BrandingProvider
- [ ] (Optional) Build admin UI with live preview
- [ ] (Optional) SSR/edge function for og:image social previews
