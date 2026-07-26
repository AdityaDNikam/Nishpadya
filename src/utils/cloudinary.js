import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const FileUploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // file has been uploaded successfully, remove the locally saved temporary file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;
    } catch (error) {
        // remove the locally saved temporary file as the upload operation failed
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (err) {
            console.error("Error unlinking file: ", err);
        }
        console.error("Error in Cloudinary upload: ", error);
        return null;
    }
}

const FileDeleteCloudinary = async (cloudinaryUrl) => {
    try {
        if (!cloudinaryUrl) return null;
        
        // Extract public ID from cloudinary URL
        // e.g. "http://res.cloudinary.com/demo/image/upload/v1570975200/sample.jpg"
        const parts = cloudinaryUrl.split('/');
        const fileWithExtension = parts[parts.length - 1];
        const publicId = fileWithExtension.split('.')[0];
        
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        console.error("Error in Cloudinary delete: ", error);
        return null;
    }
}

// Support both naming styles used in controller
const deleteFileOnCloudinary = FileDeleteCloudinary;

export { FileUploadCloudinary, FileDeleteCloudinary, deleteFileOnCloudinary };
