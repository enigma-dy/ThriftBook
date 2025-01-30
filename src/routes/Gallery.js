import express from "express";
const router = express.Router();
import { uploadImage } from "../controllers/Gallery.js";
import { multerImageFileUpload } from "../middlewares/multerFile.js";

router.post("/upload", multerImageFileUpload.single("image"), uploadImage);

export default router;
