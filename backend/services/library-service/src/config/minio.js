const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

async function initMinio() {
  try {
    const bucketName = 'library-digital-assets';
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`MinIO bucket "${bucketName}" created successfully.`);
    } else {
      console.log(`MinIO bucket "${bucketName}" already exists.`);
    }
  } catch (error) {
    console.error('MinIO initialization error:', error);
  }
}

async function generatePresignedUrl(bucketName, objectName, expirySeconds = 3600) {
  try {
    return await minioClient.presignedGetObject(bucketName, objectName, expirySeconds);
  } catch (error) {
    console.error('MinIO presigned URL error:', error);
    throw error;
  }
}

module.exports = { minioClient, initMinio, generatePresignedUrl };
