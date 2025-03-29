// utils/fileUpload.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Configure storage for property images
const propertyImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(
      process.cwd(),
      "../frontend/uploads/properties"
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `property-${uuidv4()}${ext}`);
  },
});

// File filter for images only
const propertyImageFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error(`Invalid file type. Only ${filetypes} are allowed!`), false);
};

// // Create Multer instance for property images
// export const uploadPropertyImages = multer({
//   storage: propertyImageStorage,
//   fileFilter: propertyImageFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB
//     files: 10, // Maximum 10 images
//   },
// }).array("images", 10); // 'images' is the field name

export const uploadPropertyImages = (req, res, next) => {
  const multerUpload = multer({
    storage: propertyImageStorage,
    fileFilter: propertyImageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 10,
    },
  }).array("images", 10);

  multerUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
    // Everything went fine
    next();
  });
};
