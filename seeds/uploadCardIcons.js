require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const mongoose = require('mongoose');
const BrandConfig = require('../models/brandConfig.model');
const BUCKET = process.env.S3_BUCKET_NAME;
const REGION = process.env.AWS_REGION || 'us-east-1';

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const ICONS_DIR = path.join(__dirname, '..', 'client', 'src', 'assets', 'images', 'landing');

const FILES_TO_UPLOAD = [
  { file: 'amongus.png', cardIndex: 0 },
  { file: 'anime.webp', cardIndex: 1 },
  // Card 2 (Free Coaching) had the Discord SVG inline — no file to upload
];

const MIME_MAP = {
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

async function uploadFile(filePath, s3Key) {
  const body = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_MAP[ext] || 'application/octet-stream';

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    Body: body,
    ContentType: contentType,
  }));

  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${s3Key}`;
}

async function run() {
  console.log('Uploading card icons to S3...');

  const urls = {};
  for (const { file, cardIndex } of FILES_TO_UPLOAD) {
    const filePath = path.join(ICONS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    const s3Key = `branding/reluminate/${file}`;
    const url = await uploadFile(filePath, s3Key);
    urls[cardIndex] = url;
    console.log(`Uploaded ${file} → ${url}`);
  }

  // Update the DB
  await mongoose.connect(process.env.PROD_MONGODB);
  console.log('Connected to MongoDB');

  const config = await BrandConfig.findOne({ slug: 'reluminate' });
  if (!config) {
    console.error('Reluminate config not found in DB');
    await mongoose.disconnect();
    return;
  }

  if (!config.featureCards || config.featureCards.length === 0) {
    console.error('No featureCards on config — run seedBranding.js first');
    await mongoose.disconnect();
    return;
  }

  for (const [idx, url] of Object.entries(urls)) {
    if (config.featureCards[idx]) {
      config.featureCards[idx].icon = url;
    }
  }

  await config.save();
  console.log('Updated Reluminate featureCards with icon URLs');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
