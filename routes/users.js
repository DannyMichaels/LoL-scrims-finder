const { Router } = require('express');
const controllers = require('../controllers/users');

const router = Router();

router.get('/users', controllers.getAllUsers); // GET
router.post('/users', controllers.createUser); // POST
router.post('/auth/verify/', controllers.verifyUser); // GET
router.post('/auth/login/', controllers.loginUser); // GET

module.exports = router;
