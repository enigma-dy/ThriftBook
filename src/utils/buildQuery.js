export const buildBookQuery = (filters) => {
  const {
    category,
    genre,
    minPrice,
    maxPrice,
    trending,
    author,
    search,
    minOldPrice,
    maxOldPrice,
    dateFrom,
    dateTo,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = filters;

  const query = {};

  if (category) query.category = category;
  if (genre) query.genre = genre;

  // Check for valid price values before adding them to the query
  if (minPrice && !isNaN(minPrice))
    query.newPrice = { $gte: parseFloat(minPrice) };
  if (maxPrice && !isNaN(maxPrice))
    query.newPrice = { ...query.newPrice, $lte: parseFloat(maxPrice) };

  if (minOldPrice && !isNaN(minOldPrice))
    query.oldPrice = { $gte: parseFloat(minOldPrice) };
  if (maxOldPrice && !isNaN(maxOldPrice))
    query.oldPrice = { ...query.oldPrice, $lte: parseFloat(maxOldPrice) };

  if (trending !== undefined) query.trending = trending === "true";
  if (author) query.author = author;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom && !isNaN(Date.parse(dateFrom)))
      query.createdAt.$gte = new Date(dateFrom);
    if (dateTo && !isNaN(Date.parse(dateTo)))
      query.createdAt.$lte = new Date(dateTo);
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const itemsPerPage = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * itemsPerPage;

  const sortOptions = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  return { query, options: { skip, limit: itemsPerPage, sort: sortOptions } };
};
