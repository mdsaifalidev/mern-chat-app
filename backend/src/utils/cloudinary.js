import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * @function uploadOnCloudinary
 * @description Uploads a file to Cloudinary
 * @param {string} localFilePath - The path of the file to be uploaded
 * @returns {object} - The response from Cloudinary
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    return response;
  } catch (error) {
    return null;
  } finally {
    // Delete the file from the local storage
    fs.unlinkSync(localFilePath);
  }
};

export default uploadOnCloudinary;
