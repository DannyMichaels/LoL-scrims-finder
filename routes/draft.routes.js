const { Router } = require('express');
const championsControllers = require('../controllers/champions.controllers');
const draftControllers = require('../controllers/draft.controllers');
const passport = require('passport');
const auth = require('../middleware/auth');

const router = Router();

// Champion data (public, API key only)
router.get('/champions', championsControllers.getAllChampions);

// Draft routes (authenticated)
router.post(
  '/drafts',
  passport.authenticate('jwt', { session: false }),
  auth,
  draftControllers.createDraft
);

router.get(
  '/drafts/:id',
  passport.authenticate('jwt', { session: false }),
  auth,
  draftControllers.getDraftById
);

router.patch(
  '/drafts/:id/cancel',
  passport.authenticate('jwt', { session: false }),
  auth,
  draftControllers.cancelDraft
);

router.get(
  '/drafts/scrim/:scrimId',
  passport.authenticate('jwt', { session: false }),
  auth,
  draftControllers.getDraftByScrimId
);

module.exports = router;
