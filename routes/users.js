const { Router } = require('express');
const controllers = require('../controllers/users');

const router = Router();

router.get('/users', controllers.getAllUsers); // GET
router.get('/users/:id', controllers.getUserById); // GET (this route requires a adminKey query)
router.get('/users/:id/created-scrims', controllers.getUserCreatedScrims); // GET
// router.put('/users/:id/scrims', controllers.getUserParticipatingScrims); // GET

module.exports = router;
