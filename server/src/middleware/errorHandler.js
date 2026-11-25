import { ZodError } from "zod";
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export const notFound = (req, _res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// Central error handler: every failure leaves the API as { message, code?, errors? }.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const errors = {};
    for (const issue of err.issues) errors[issue.path.join(".") || "form"] ??= issue.message;
    return res.status(422).json({ message: "Please fix the highlighted fields.", errors });
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, code: err.code, errors: err.errors });
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "That file is too large." : "The upload could not be processed.";
    return res.status(400).json({ message });
  }
  if (err.name === "ValidationError") {
    const errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    return res.status(422).json({ message: "Please fix the highlighted fields.", errors });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "value";
    return res.status(409).json({ message: `That ${field} is already in use.`, errors: { [field]: "Already in use" } });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid identifier." });

  console.error(err);
  res.status(500).json({ message: "Something went wrong on our side. Please try again.", ...(env.isProd ? {} : { stack: err.stack }) });
}
