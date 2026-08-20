import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export function notFoundMiddleware(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, "ROUTE_NOT_FOUND"));
}

export function errorMiddleware(err, req, res, next) {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err.message || "Internal server error";
  let errorCode = err instanceof ApiError ? err.errorCode : "INTERNAL_ERROR";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 422;
    errorCode = "VALIDATION_ERROR";
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = "DUPLICATE_KEY";
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : "Duplicate value";
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    errorCode = "INVALID_ID";
    message = `Invalid value for ${err.path}`;
  }

  // Multer upload errors
  if (err.name === "MulterError") {
    statusCode = 422;
    errorCode = err.code || "UPLOAD_ERROR";
    message = err.code === "LIMIT_FILE_SIZE" ? "Uploaded file exceeds the maximum allowed size" : err.message;
  }

  if (env.nodeEnv !== "production" && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
  });
}
