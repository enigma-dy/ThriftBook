import Gallery from "../models/Gallery.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImageOnCloudinary } from "../utils/cloudinary.js";

export const uploadImage = asyncHandler(async (req, res, next) => {
 

  const imagePath = req.file?.path;

  if (!req.file || !imagePath) {
    return next(new apiError(400, "No file uploaded"));
  }

  const cloudinaryResult = await uploadImageOnCloudinary(imagePath);

  if (!cloudinaryResult) {
    return next(new apiError(500, "Failed to upload image to Cloudinary"));
  }

  
  const Image = new Gallery({
    image: {
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
    },
  });

  const savedImage = await Image.save();

  const newImage = await Gallery.findById(savedImage._id);

  if (!newImage) {
    return next(
      new apiError(
        500,
        "Something went wrong while saving the image in database"
      )
    );
  }

  res.status(201).json({
    success: true,
    message: "Image uploaded successfully!",
    image: newImage,
  });
});
