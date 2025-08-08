const { Router } = require('express');
const controllers = require('../controllers/scrims.controllers.refactored');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const passport = require('passport');
const router = Router();

// Public read endpoints with advanced filtering
router.get('/scrims', controllers.getAllScrims); // GET with pagination and filters
router.get('/scrims/today', controllers.getTodaysScrims); // GET today's scrims
router.get('/scrims/upcoming', controllers.getUpcomingScrims); // GET upcoming scrims
router.get('/scrims/current', controllers.getCurrentScrims); // GET current/active scrims
router.get('/scrims/search', controllers.searchScrims); // GET search scrims by title/creator
router.get('/scrims/stats', controllers.getScrimStats); // GET scrim statistics
router.get('/scrims/user/:userId', controllers.getUserScrims); // GET user's scrims
router.get('/scrims/:id', controllers.getScrimById); // GET specific scrim

// Protected write endpoints (require authentication)
router.post(
  '/scrims',
  passport.authenticate('jwt', { session: false }),
  admin,
  controllers.createScrim
); // POST create new scrim

router.put(
  '/scrims/:id',
  passport.authenticate('jwt', { session: false }),
  admin,
  controllers.updateScrim
); // PUT update scrim

router.delete(
  '/scrims/:id',
  passport.authenticate('jwt', { session: false }),
  admin,
  controllers.deleteScrim
); // DELETE scrim

// Player/Caster management endpoints
router.patch(
  '/scrims/:scrimId/insert-player/:userId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.insertPlayerInScrim
); // PATCH add player

router.patch(
  '/scrims/:scrimId/remove-player/:userId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.removePlayerFromScrim
); // PATCH remove player

router.patch(
  '/scrims/:scrimId/insert-caster/:userId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.insertCasterInScrim
); // PATCH add caster

router.patch(
  '/scrims/:scrimId/remove-caster/:userId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.removeCasterFromScrim
); // PATCH remove caster

router.patch(
  '/scrims/:scrimId/move-player/:userId',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.movePlayerInScrim
); // PATCH move player between teams

router.patch(
  '/scrims/:scrimId/swap-players',
  passport.authenticate('jwt', { session: false }),
  admin,
  controllers.swapPlayersInScrim
); // PATCH swap two players

// Game result endpoints
router.patch(
  '/scrims/:id/set-winner',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.setScrimWinner
); // PATCH set winning team

router.patch(
  '/scrims/:id/add-image',
  passport.authenticate('jwt', { session: false }),
  auth,
  controllers.addImageToScrim
); // PATCH add post-game image

router.patch(
  '/scrims/:id/remove-image',
  passport.authenticate('jwt', { session: false }),
  admin,
  controllers.removeImageFromScrim
); // PATCH remove post-game image

module.exports = router;