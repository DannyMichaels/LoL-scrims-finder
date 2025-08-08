const { PutObjectCommand } = require('@aws-sdk/client-s3');
const KEYS = require('../config/keys');
const createS3 = require('./createS3');

/*
order of operations:
  - client uploads image, image gets converted to base64 string using FileReader();
  - client sends the base64 string in the payload to the back-end
  - the back-end takes the base64 string and converts it into data, then it uses the data to upload to S3.
*/
async function uploadToBucket({
  fileName,
  base64,
  dirName = '',
  s3Client = createS3(),
}) {
  const actualBase64 = base64.toString().split(',')[1]; // remove the data:image/jpeg;base64, thing from the base64 if it's there, or else Buffer.alloc wont work

  const base64Data = Buffer.from(actualBase64, 'base64');

  const key = dirName ? `${dirName}/${fileName}` : fileName;
  
  const params = {
    Body: base64Data,
    Bucket: KEYS.S3_BUCKET_NAME,
    Key: key,
    ContentType: 'image/jpeg',
  };

  const command = new PutObjectCommand(params);
  const result = await s3Client.send(command);

  return {
    ...result,
    key: key,
    location: `https://${KEYS.S3_BUCKET_NAME}.s3.${KEYS.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`,
    bucket: KEYS.S3_BUCKET_NAME,
  };
}

module.exports = uploadToBucket;
