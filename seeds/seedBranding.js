require('dotenv').config();
const mongoose = require('mongoose');
const BrandConfig = require('../models/brandConfig.model');

const MONGO_URI = process.env.PROD_MONGODB;

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await BrandConfig.findOne({ slug: 'reluminate' });
  if (existing) {
    console.log('Reluminate brand config already exists, skipping seed.');
    await mongoose.disconnect();
    return;
  }

  await BrandConfig.create({
    name: 'Reluminate',
    slug: 'reluminate',
    domains: ['reluminate.gg', 'www.reluminate.gg', 'localhost'],
    isDefault: true,
    branding: {
      brandName: 'RELUMINATE.GG',
      tagline: 'Lighting up the rift',
      logoUrl: '/reluminate-logo.png',
      faviconUrl: '/reluminate-logo.png',
      heroBackgroundUrl: 'reluminate_thresh',
    },
    colors: {
      primaryMain: '#2196F3',
      primaryLight: '#64B5F6',
      primaryDark: '#1976D2',
      backgroundDefault: '#0a0e1a',
      backgroundPaper: '#121826',
    },
    socialLinks: {
      discord: 'https://discord.com/invite/Fn8d3UAD6y',
      twitch: 'https://www.twitch.tv/reluminategg',
      twitter: 'https://twitter.com/Reluminategg',
    },
  });

  console.log('Reluminate brand config seeded successfully.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
