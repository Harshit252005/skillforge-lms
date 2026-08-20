const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Connect to your Cloudinary account
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Setup a "Smart" Storage for BOTH Images and Videos
const combinedStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // If the frontend sends a video...
        if (file.fieldname === 'video') {
            return {
                folder: 'skillforge_videos',
                resource_type: 'video',
                allowed_formats: ['mp4', 'mov', 'avi', 'mkv']
            };
        }
        // Otherwise, it's the thumbnail image...
        return {
            folder: 'skillforge_thumbnails',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
        };
    }
});

// 3. Create the Multer upload middlewares
const uploadCombined = multer({ storage: combinedStorage });

module.exports = {
    uploadCombined
};