import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { UPLOAD_DIR } from "./services/upload.service.js";

export const app = express();

app.set("trust proxy", 1); // correct client IPs for rate limiting behind a reverse proxy
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // images are loaded by the client origin
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(compression());
if (!env.isProd) app.use(morgan("dev"));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(mongoSanitize()); // strips $ and . operators to block NoSQL injection

// Locally stored uploads (only used when Cloudinary isn't configured)
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d" }));

app.use("/api", apiLimiter, routes);
app.use(notFound);
app.use(errorHandler);
