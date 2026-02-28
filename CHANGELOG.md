# Changelog

## 2/28/2026

### Added: Multi-Tenant White-Label Branding System
A complete white-label branding system that allows deploying the same app for multiple organizations on different domains, each with its own branding, colors, logos, and hero backgrounds — all managed via an admin UI. Same database, same users, same scrims — only the skin changes.

#### Backend
- **BrandConfig model** (`models/brandConfig.model.js`) — MongoDB schema for per-tenant branding (name, slug, domains, colors, branding assets, social links)
- **Branding API** (`controllers/branding.controllers.js`, `routes/branding.routes.js`) — CRUD endpoints with in-memory 5-min cache
  - `GET /api/branding?hostname=` — Fetch config by domain (public)
  - `GET /api/branding/manifest?hostname=` — Dynamic PWA manifest (public)
  - `GET /api/branding/all` — List all configs (admin)
  - `POST /api/branding` — Create tenant (admin)
  - `PATCH /api/branding/:id` — Update tenant (admin)
  - `POST /api/branding/upload-asset` — Upload logo/favicon to S3 (admin)
- **Dynamic CORS** (`server.js`) — Reads tenant domains from DB so new domains are automatically allowed
- **Seed script** (`seeds/seedBranding.js`) — Seeds default Reluminate.gg config. Run with `node seeds/seedBranding.js`

#### Frontend — Theme & Provider
- **Theme factory** (`appTheme.js`) — Converted static theme to `createBrandTheme(colors)` factory; all hardcoded `#2196F3`/`rgba(33,150,243,...)` replaced with `alpha(primary, ...)` calls
- **Dynamic contrast text** — Button text auto-switches between black/white based on primary color luminance (fixes white-on-white buttons)
- **BrandingProvider** (`providers/BrandingProvider.jsx`) — Fetches branding config on mount by `window.location.hostname`, gates rendering with loading screen, provides `BrandingContext`
- **useBranding hook** (`hooks/useBranding.js`) — Returns `brandName`, `tagline`, `logoUrl`, `faviconUrl`, `heroBackgroundUrl`, `socialLinks`, `colors`, `_id`, `slug`

#### Frontend — Refactored Components (~27 files)
- Replaced all hardcoded "RELUMINATE.GG" text and `/reluminate-logo.png` paths with `useBranding()` values across: Navbar, LandingNavbar, HeroSection, Footer, useNotifications, SignUp, App, UserProfile, Guide, ScrimDetail, AdminDashboard
- Replaced all inline `#2196F3`, `#64B5F6`, `#1976D2`, `rgba(33,150,243,...)` with theme palette references across: GlassPanel, GlassInput, NavbarDrawerItems, NavbarDropdowns, FeaturesSection, CTAButton, SocialButton, Scrims, ScrimCreate, ScrimEdit, ScrimSection.styles, ScrimSectionHeader, ScrimSectionExpander, ScrimSectionMiddleAreaBox, ScrimsColumn, CountdownTimer, RefreshScrimsButton, ProfileAccountDetails, UserStatsCharts, ChatBubble

#### Frontend — Admin Branding UI
- **BrandingConfig** (`features/admin/components/BrandingConfig.jsx`) — Admin page at `/admin/branding` with tenant selector, create new tenant flow
- **BrandingForm** (`features/admin/components/BrandingForm.jsx`) — Form with brand identity, logo/favicon upload, hero background picker (from existing game assets), primary color picker with advanced overrides, social links
- **BrandingPreview** (`features/admin/components/BrandingPreview.jsx`) — 60% scaled live preview of Navbar + Hero that updates instantly

#### Frontend — Hero Backgrounds
- **Hero backgrounds map** (`assets/heroBackgrounds.js`) — Imports all 7 existing background images; admin picks from a visual grid instead of uploading
- **HeroSection** now uses dynamic background from branding config via `resolveHeroBackground()`

#### Frontend — Dynamic Meta Tags
- `BrandingProvider` dynamically updates `<link rel="icon">`, `<link rel="apple-touch-icon">`, `<meta property="og:image">`, and `<link rel="manifest">` after config loads
- React Helmet dynamically sets `<title>` and `<meta name="description">` from branding
- `index.html` ships with neutral defaults as fallbacks during loading

#### Documentation
- **HTML documentation** (`docs/branding-system.html`) — Comprehensive doc covering architecture, API reference, file manifest, and usage
