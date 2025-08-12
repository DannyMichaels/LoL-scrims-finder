const User = require('../models/user.model');

// Middleware to check if user needs to migrate from Google to Riot
const checkMigrationRequired = async (req, res, next) => {
  try {
    // Skip if no user is authenticated
    if (!req.user || !req.user._id) {
      return next();
    }

    // Get fresh user data
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return next();
    }

    // Check if user is using Google auth - always require migration
    if (user.authProvider === 'google') {
      // Mark that user has been prompted if not already
      if (user.migrationStatus.status === 'not_started') {
        user.migrationStatus.status = 'prompted';
        user.migrationStatus.promptedAt = new Date();
        await user.save();
      }
      
      return res.status(403).json({
        error: 'migration_required',
        message: 'Google authentication is no longer supported. Please migrate to Riot Sign-On to continue.',
        migrationUrl: '/migrate-account',
        requiresRiotAuth: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Migration check error:', error);
    next(); // Continue even if check fails
  }
};

// Middleware for non-critical routes (no longer allows Google users)
const softMigrationCheck = async (req, res, next) => {
  // Since we're forcing migration, this is now the same as checkMigrationRequired
  return checkMigrationRequired(req, res, next);
};

module.exports = {
  checkMigrationRequired,
  softMigrationCheck
};