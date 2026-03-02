const mongoose = require('mongoose');

const brandConfigSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    domains: [{ type: String }],
    isDefault: { type: Boolean, default: false },
    branding: {
      brandName: { type: String, default: 'RELUMINATE.GG' },
      tagline: { type: String, default: 'Lighting up the rift' },
      logoUrl: { type: String, default: '/reluminate-logo.png' },
      faviconUrl: { type: String, default: '/reluminate-logo.png' },
      heroBackgroundUrl: { type: String, default: '' },
      navbarLogoSize: { type: Number, default: 36 },
      showNavbarTitle: { type: Boolean, default: true },
    },
    colors: {
      primaryMain: { type: String, default: '#2196F3' },
      primaryLight: { type: String },
      primaryDark: { type: String },
      backgroundDefault: { type: String, default: '#0a0e1a' },
      backgroundPaper: { type: String, default: '#121826' },
    },
    socialLinks: {
      discord: { type: String, default: '' },
      twitch: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    featureCards: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

brandConfigSchema.index({ domains: 1 });
brandConfigSchema.index({ isDefault: 1 });

module.exports = mongoose.model('BrandConfig', brandConfigSchema);
