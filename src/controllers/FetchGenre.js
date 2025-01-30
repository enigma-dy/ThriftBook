import subjectGenreMap from "../models/data/modelData.js";

export const getSubjectsWithGenres = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: subjectGenreMap,
    });
  } catch (error) {
    next(new apiError(500, "Failed to fetch subjects and genres"));
  }
};
