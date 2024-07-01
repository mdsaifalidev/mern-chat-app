import multer from "multer";
import ApiError from "../utils/ApiError.js";
import path from "path";

const __dirname = path.resolve();
const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
const UPLOAD_PATH = path.join(__dirname, "backend/public/temp");

/**
 * Multer middleware configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

/**
 * @function fileFilter
 * @description Filters files by mimetype
 * @param {Array<string>} allowedMimes - The allowed mimetypes
 */
const fileFilter = (allowedMimes) => (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type. Only ${allowedMimes.join(", ")} files are allowed.`
      )
    );
  }
};

const allowedMimes = ["image/jpeg", "image/png", "image/gif"];

// Multer middleware
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter(allowedMimes),
});

export default upload;
