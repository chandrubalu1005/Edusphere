const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const bucketName = 'avatars';

// Initialize bucket
minioClient.bucketExists(bucketName, (err, exists) => {
    if (err) {
        return console.log('MinIO Error:', err);
    }
    if (!exists) {
        minioClient.makeBucket(bucketName, 'us-east-1', (err) => {
            if (err) return console.log('Error creating bucket:', err);
            console.log(`Bucket ${bucketName} created successfully`);
        });
    }
});

module.exports = { minioClient, bucketName };
