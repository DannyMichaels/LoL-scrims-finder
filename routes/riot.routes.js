const { Router } = require('express');
const controllers = require('../controllers/riot.controllers');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const passport = require('passport');
const router = Router();

// Initialize tournament when countdown reaches 0
router.post(
  '/scrims/:scrimId/riot/initialize',
  passport.authenticate('jwt', { session: false }),
  admin,
  controllers.initializeRiotTournament
);

// Get tournament code for a scrim
router.get(
  '/scrims/:scrimId/riot/tournament-code',
  controllers.getTournamentCode
);

// Update tournament participants
router.put(
  '/scrims/:scrimId/riot/participants',
  passport.authenticate('jwt', { session: false }),
  admin,
  controllers.updateTournamentParticipants
);

// Get lobby events
router.get(
  '/scrims/:scrimId/riot/lobby-events',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.getLobbyEvents
);

// Riot API callback endpoint (no auth required as it's called by Riot)
router.post('/riot/callback', controllers.handleRiotCallback);

module.exports = router;