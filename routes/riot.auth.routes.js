const { Router } = require('express');
const controllers = require('../controllers/riot.auth.controllers');
const auth = require('../middleware/auth');

const router = Router();

// Public routes - no auth required
router.get('/auth/check-method', controllers.checkAuthMethod); // Check if Riot SSO is required
router.get('/auth/riot/init', controllers.initRiotLogin); // Initialize Riot OAuth flow
router.get('/auth/riot/callback', controllers.handleRiotCallback); // Handle OAuth callback
router.post('/auth/riot/complete-signup', controllers.completeRiotSignup); // Complete signup for new Riot users
router.post('/auth/riot/link-accounts', controllers.linkAccounts); // Link Google account with Riot

// Protected routes - require authentication
router.get('/auth/migration-status', auth, controllers.checkMigrationStatus); // Check if user needs to migrate
router.post('/auth/skip-migration', auth, controllers.skipMigration); // Temporarily skip migration
router.post('/auth/riot/refresh-token', auth, controllers.refreshRiotToken); // Refresh Riot access token

module.exports = router;