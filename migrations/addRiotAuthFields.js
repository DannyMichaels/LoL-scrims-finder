/**
 * Migration script to add Riot authentication fields to existing users
 * Run this script once to update all existing Google users
 * 
 * Usage: node migrations/addRiotAuthFields.js
 */

const mongoose = require('mongoose');
const User = require('../models/user.model');
require('dotenv').config();

const MONGODB_URI = process.env.PROD_MONGODB || process.env.MONGODB_URI;

async function migrateUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Count existing users
    const totalUsers = await User.countDocuments();
    console.log(`Found ${totalUsers} total users`);
    
    // Update all existing users who don't have authProvider set
    const result = await User.updateMany(
      { 
        authProvider: { $exists: false },
        uid: { $exists: true } // Only update users with Google UID
      },
      {
        $set: {
          authProvider: 'google',
          'migrationStatus.status': 'not_started',
          'migrationStatus.promptedAt': null,
          'migrationStatus.completedAt': null,
          'migrationStatus.skippedUntil': null
        }
      }
    );
    
    console.log(`Updated ${result.modifiedCount} users to have Google auth provider`);
    
    // Check if any users already have Riot auth
    const riotUsers = await User.countDocuments({ authProvider: 'riot' });
    console.log(`Found ${riotUsers} users already using Riot authentication`);
    
    // Create indexes for better performance
    console.log('Creating indexes...');
    
    try {
      await User.collection.createIndex({ 'riotAuth.puuid': 1 }, { sparse: true });
      console.log('Created index for riotAuth.puuid');
    } catch (e) {
      if (e.code === 11000) {
        console.log('Index for riotAuth.puuid already exists');
      } else {
        console.error('Error creating index for riotAuth.puuid:', e.message);
      }
    }
    
    try {
      await User.collection.createIndex({ authProvider: 1 });
      console.log('Created index for authProvider');
    } catch (e) {
      if (e.code === 11000) {
        console.log('Index for authProvider already exists');
      } else {
        console.error('Error creating index for authProvider:', e.message);
      }
    }
    
    try {
      await User.collection.createIndex({ 'migrationStatus.status': 1 });
      console.log('Created index for migrationStatus.status');
    } catch (e) {
      if (e.code === 11000) {
        console.log('Index for migrationStatus.status already exists');
      } else {
        console.error('Error creating index for migrationStatus.status:', e.message);
      }
    }
    
    // Summary
    console.log('\n=== Migration Summary ===');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Updated to Google auth: ${result.modifiedCount}`);
    console.log(`Already on Riot auth: ${riotUsers}`);
    console.log(`Migration status:
    - not_started: ${await User.countDocuments({ 'migrationStatus.status': 'not_started' })}
    - prompted: ${await User.countDocuments({ 'migrationStatus.status': 'prompted' })}
    - completed: ${await User.countDocuments({ 'migrationStatus.status': 'completed' })}
    - skipped: ${await User.countDocuments({ 'migrationStatus.status': 'skipped' })}`);
    
    console.log('\nMigration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateUsers();