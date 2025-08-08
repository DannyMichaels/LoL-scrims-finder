const { S3Client } = require('@aws-sdk/client-s3');
const KEYS = require('../config/keys');

const createS3 = () => {
  const s3 = new S3Client({
    region: KEYS.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: KEYS.S3_ACCESS_KEY_ID,
      secretAccessKey: KEYS.S3_SECRET_ACCESS_KEY,
    },
  });

  return s3;
};

module.exports = createS3;
