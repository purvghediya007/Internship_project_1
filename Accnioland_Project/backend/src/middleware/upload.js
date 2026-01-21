const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    // ✅ IMAGE UPLOAD
    if (file.mimetype.startsWith("image/")) {
      return {
        folder: "issues/images",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      };
    }

    // ✅ PDF UPLOAD
    if (file.mimetype === "application/pdf") {
      return {
        folder: "issues/floor-plans",
        resource_type: "raw",
        format: "pdf",
      };
    }

    return {
      folder: "issues/others",
    };
  },
});

const upload = multer({ storage });

module.exports = upload;