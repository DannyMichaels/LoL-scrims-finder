const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const BrandConfig = require('../models/brandConfig.model');
const Cache = require('../utils/Cache');
const uploadToBucket = require('../utils/uploadToBucket');
const createS3 = require('../utils/createS3');
const KEYS = require('../config/keys');

const brandingCache = new Cache({
  timeToLive: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 60 * 1000,
});

function invalidateCache() {
  brandingCache.clear();
}

// GET /api/branding?hostname=
async function getBrandingByHostname(req, res) {
  try {
    const { hostname } = req.query;
    if (!hostname) {
      return res.status(400).json({ error: 'hostname query param required' });
    }

    const cached = brandingCache.get(hostname);
    if (cached) return res.json(cached);

    let config = await BrandConfig.findOne({ domains: hostname });

    if (!config) {
      config = await BrandConfig.findOne({ isDefault: true });
    }

    if (!config) {
      return res.status(404).json({ error: 'No branding config found' });
    }

    brandingCache.set(hostname, config);
    return res.json(config);
  } catch (error) {
    console.error('getBrandingByHostname error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/branding/manifest?hostname=
async function getManifest(req, res) {
  try {
    const { hostname } = req.query;

    let config;
    if (hostname) {
      config = await BrandConfig.findOne({ domains: hostname });
    }
    if (!config) {
      config = await BrandConfig.findOne({ isDefault: true });
    }

    const brandName = config?.branding?.brandName || 'Scrims Finder';
    const primaryMain = config?.colors?.primaryMain || '#2196F3';
    const iconUrl = config?.branding?.logoUrl || '/reluminate-logo.png';

    const manifest = {
      short_name: brandName,
      name: brandName,
      icons: [
        {
          src: iconUrl,
          sizes: '64x64 32x32 24x24 16x16',
          type: 'image/png',
        },
        {
          src: iconUrl,
          type: 'image/png',
          sizes: '192x192',
        },
        {
          src: iconUrl,
          type: 'image/png',
          sizes: '512x512',
        },
      ],
      start_url: '.',
      display: 'standalone',
      theme_color: primaryMain,
      background_color: config?.colors?.backgroundDefault || '#0a0e1a',
    };

    res.setHeader('Content-Type', 'application/manifest+json');
    return res.json(manifest);
  } catch (error) {
    console.error('getManifest error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/branding/all (super-admin)
async function getAllBrandConfigs(req, res) {
  try {
    const configs = await BrandConfig.find().sort({ createdAt: -1 });
    return res.json(configs);
  } catch (error) {
    console.error('getAllBrandConfigs error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/branding (super-admin)
async function createBrandConfig(req, res) {
  try {
    const config = new BrandConfig(req.body);
    await config.save();
    invalidateCache();
    return res.status(201).json(config);
  } catch (error) {
    console.error('createBrandConfig error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}

// PATCH /api/branding/:id (super-admin)
async function updateBrandConfig(req, res) {
  try {
    const config = await BrandConfig.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }
    invalidateCache();
    return res.json(config);
  } catch (error) {
    console.error('updateBrandConfig error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/branding/upload-asset (super-admin)
async function uploadBrandAsset(req, res) {
  try {
    const { base64, fileName, slug } = req.body;
    if (!base64 || !fileName || !slug) {
      return res
        .status(400)
        .json({ error: 'base64, fileName, and slug are required' });
    }

    const result = await uploadToBucket({
      fileName,
      base64,
      dirName: `branding/${slug}`,
    });

    return res.json({ url: result.location });
  } catch (error) {
    console.error('uploadBrandAsset error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/branding/assets?prefix=branding/ (super-admin)
async function listBrandAssets(req, res) {
  try {
    const s3 = createS3();
    const prefix = req.query.prefix || 'branding/';

    const command = new ListObjectsV2Command({
      Bucket: KEYS.S3_BUCKET_NAME,
      Prefix: prefix,
    });

    const result = await s3.send(command);
    const region = KEYS.AWS_REGION || 'us-east-1';
    const bucket = KEYS.S3_BUCKET_NAME;

    const assets = (result.Contents || [])
      .filter((obj) => !obj.Key.endsWith('/'))
      .map((obj) => ({
        key: obj.Key,
        url: `https://${bucket}.s3.${region}.amazonaws.com/${obj.Key}`,
        size: obj.Size,
        lastModified: obj.LastModified,
      }));

    return res.json(assets);
  } catch (error) {
    console.error('listBrandAssets error:', error);
    return res.status(500).json({ error: 'Failed to list S3 assets' });
  }
}

// Helper: get all domains from BrandConfig for CORS
async function getAllDomains() {
  const cacheKey = '__all_domains__';
  const cached = brandingCache.get(cacheKey);
  if (cached) return cached;

  const configs = await BrandConfig.find({}, { domains: 1 });
  const domains = configs.flatMap((c) => c.domains);
  brandingCache.set(cacheKey, domains);
  return domains;
}

module.exports = {
  getBrandingByHostname,
  getManifest,
  getAllBrandConfigs,
  createBrandConfig,
  updateBrandConfig,
  uploadBrandAsset,
  listBrandAssets,
  getAllDomains,
};
