const { Router } = require('express');
const controllers = require('../controllers/branding.controllers');
const admin = require('../middleware/admin');

const router = Router();

// Public routes (API key only via global middleware)
router.get('/branding', controllers.getBrandingByHostname);
router.get('/branding/manifest', controllers.getManifest);

// Admin routes
router.get('/branding/all', admin, controllers.getAllBrandConfigs);
router.post('/branding', admin, controllers.createBrandConfig);
router.patch('/branding/:id', admin, controllers.updateBrandConfig);
router.post('/branding/upload-asset', admin, controllers.uploadBrandAsset);

module.exports = router;
