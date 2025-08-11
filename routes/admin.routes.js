const { Router } = require('express');
const controllers = require('../controllers/admin.controllers');
const admin = require('../middleware/admin');
const router = Router();

router.get('/admin/all-bans-history', admin, controllers.getAllBans); // GET
router.get('/admin/dashboard-stats', admin, controllers.getDashboardStats); // GET
router.get('/admin/recent-activities', admin, controllers.getRecentActivities); // GET
router.post('/admin/banUser', admin, controllers.banUser); // POST
router.post('/admin/unbanUser', admin, controllers.unbanUser); // POST
router.post('/admin/updateUser/:userId', admin, controllers.updateUserAsAdmin); // POST
router.post('/admin/lift-expired-bans', admin, controllers.liftExpiredBans); // POST

module.exports = router;
