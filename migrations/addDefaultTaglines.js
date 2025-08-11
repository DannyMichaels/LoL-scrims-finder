const mongoose = require('mongoose');
const User = require('../models/user.model');
require('dotenv').config();

// Default taglines based on region
const REGION_TAGLINES = {
  NA: 'NA1',
  EUW: 'EUW1',
  EUNE: 'EUN1',
  LAN: 'LAN1',
  OCE: 'OCE1',
  BR: 'BR1',
  JP: 'JP1',
  KR: 'KR',
  TR: 'TR1',
  RU: 'RU',
  LAS: 'LAS1',
};

async function addDefaultTaglines() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.PROD_MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all users without a summonerTagline
    const usersWithoutTagline = await User.find({
      $or: [
        { summonerTagline: { $exists: false } },
        { summonerTagline: null },
        { summonerTagline: '' },
      ],
    });

    console.log(`Found ${usersWithoutTagline.length} users without taglines`);

    let updatedCount = 0;
    let errors = [];

    for (const user of usersWithoutTagline) {
      try {
        // Get default tagline based on region, or use region as fallback
        const defaultTagline =
          REGION_TAGLINES[user.region] || `${user.region}1`;

        // Use updateOne to bypass validation issues with other fields
        await User.updateOne(
          { _id: user._id },
          { $set: { summonerTagline: defaultTagline } }
        );

        updatedCount++;
        console.log(
          `Updated ${user.name} (${user.region}) with tagline: ${defaultTagline}`
        );
      } catch (error) {
        console.error(`Error updating user ${user.name}:`, error.message);
        errors.push({ user: user.name, error: error.message });
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`Successfully updated: ${updatedCount} users`);

    if (errors.length > 0) {
      console.log(`Errors: ${errors.length}`);
      console.log('Error details:', errors);
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
addDefaultTaglines()
  .then(() => {
    console.log('Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script error:', error);
    process.exit(1);
  });
