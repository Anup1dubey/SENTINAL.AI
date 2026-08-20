import multer from "multer";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), env.uploadDir, "inspections"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(ApiError.validation("Only JPG, PNG, and WEBP images are allowed", "INVALID_FILE_TYPE"));
    return;
  }
  cb(null, true);
}

export const uploadInspectionImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxUploadSizeMb * 1024 * 1024 },
}).single("image");
