require('dotenv').config();
const mongoose = require('mongoose');
const BrandConfig = require('../models/brandConfig.model');

const MONGO_URI = process.env.PROD_MONGODB;

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await BrandConfig.findOne({ slug: 'reluminate' });
  if (existing) {
    // Patch in featureCards if missing
    if (!existing.featureCards || existing.featureCards.length === 0) {
      existing.featureCards = [
        {
          title: 'EVENTS & TOURNAMENTS',
          description:
            '5v5 casted customs every friday!\nPrized events + giveaways\nRandom game modes\nGuest speakers from your favorite\ncreators',
          icon: 'https://lol-scrims-finder.s3.us-east-1.amazonaws.com/branding/reluminate/amongus.png',
        },
        {
          title: 'COMMUNITY',
          description:
            "Everyone has a reason for playing league.\nWhether you're trying to climb the ladder,\nfind a duo, or escape reality. We're\nbuilding a community for it all.",
          icon: 'https://lol-scrims-finder.s3.us-east-1.amazonaws.com/branding/reluminate/anime.webp',
        },
        {
          title: 'FREE COACHING',
          description:
            'Join the Discord for free coaching in\nclassroom settings from master-challenger\nplayers. All roles, all lanes, all playstyles.',
          icon: 'https://lol-scrims-finder.s3.us-east-1.amazonaws.com/branding/reluminate/discord.svg',
        },
      ];
      await existing.save();
      console.log('Patched featureCards onto existing Reluminate config.');
    } else {
      console.log('Reluminate brand config already exists with featureCards, skipping.');
    }
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
    featureCards: [
      {
        title: 'EVENTS & TOURNAMENTS',
        description:
          '5v5 casted customs every friday!\nPrized events + giveaways\nRandom game modes\nGuest speakers from your favorite\ncreators',
        icon: 'https://lol-scrims-finder.s3.us-east-1.amazonaws.com/branding/reluminate/amongus.png',
      },
      {
        title: 'COMMUNITY',
        description:
          "Everyone has a reason for playing league.\nWhether you're trying to climb the ladder,\nfind a duo, or escape reality. We're\nbuilding a community for it all.",
        icon: 'https://lol-scrims-finder.s3.us-east-1.amazonaws.com/branding/reluminate/anime.webp',
      },
      {
        title: 'FREE COACHING',
        description:
          'Join the Discord for free coaching in\nclassroom settings from master-challenger\nplayers. All roles, all lanes, all playstyles.',
        icon: 'https://lol-scrims-finder.s3.us-east-1.amazonaws.com/branding/reluminate/discord.svg',
      },
    ],
  });

  console.log('Reluminate brand config seeded successfully.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
