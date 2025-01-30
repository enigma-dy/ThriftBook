import { v2 as cloudinary } from "cloudinary";

import { apiError } from "../utils/apiError.js";
import dotenv from "dotenv";
import streamifier from "streamifier";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageOnCloudinary = async (imageBuffer) => {
  try {
    const stream = streamifier.createReadStream(imageBuffer);

    // Upload to Cloudinary as a stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_IMAGE_FOLDER,
          resource_type: "image",
          transformation: [
            {
              width: 800,
              height: 800,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(new Error("Image upload failed"));
          }
          resolve(result);
        }
      );

      // Pipe the buffer to the upload stream
      stream.pipe(uploadStream);
    });

    return uploadResult;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    throw new apiError(500, "Image upload failed");
  }
};

const deleteImageFromCloudinary = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    // console.log("Cloudinary file deleted:", response);
    return response;
  } catch (error) {
    console.error("Cloudinary deletion failed:", error.message);
    return null;
  }
};

const uploadFileToCloudinary = async (fileData, fileName) => {
  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: process.env.CLOUDINARY_FILE_FOLDER,
          public_id: fileName,
          type: "upload",
        },
        (error, result) => {
          if (error) {
            reject(new Error("File upload failed"));
          } else {
            resolve(result);
          }
        }
      );

      streamifier.createReadStream(fileData).pipe(uploadStream);
    });

    return uploadResult;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error.message);
    throw new apiError(500, "File upload failed");
  }
};

export {
  uploadImageOnCloudinary,
  deleteImageFromCloudinary,
  uploadFileToCloudinary,
};
