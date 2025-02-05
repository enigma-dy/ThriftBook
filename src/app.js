import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.js";
import GalleryRoutes from "./routes/Gallery.js";
import UserRoutes from "./routes/User.js";
import BookRoutes from "./routes/Book.js";
import OrderRoutes from "./routes/Order.js";
import AdminStatsRoutes from "./routes/admin.stats.js";
import Categories from "./routes/Category.js";
import Access from "./routes/Access.js";
import Webhook from "./routes/Payment.js";

const app = express();
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/category", Categories);
app.use("/gallery", GalleryRoutes);
app.use("/user", UserRoutes);
app.use("/book", BookRoutes);
app.use("/order", OrderRoutes);
app.use("/admin-stats", AdminStatsRoutes);
app.use("/access", Access);
app.use("/payment", Webhook);

app.use(errorHandler);

export default app;
