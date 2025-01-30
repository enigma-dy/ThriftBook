import express from "express";

import { getSubjectsWithGenres } from "../controllers/FetchGenre.js";

const router = express.Router();
router.get("/", getSubjectsWithGenres);

export default router;
