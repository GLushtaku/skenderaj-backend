const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Upload image to Cloudinary
router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "skenderaj-places",
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto" },
      ],
    });

    res.json({
      message: "OK",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading image" });
  }
});

// Delete image from Cloudinary
router.delete("/image/:publicId", async (req, res) => {
  try {
    const result = await cloudinary.uploader.destroy(req.params.publicId);

    if (result.result === "ok") {
      res.json({ message: "OK" });
    } else {
      res.status(400).json({ message: "Error deleting image" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error deleting image" });
  }
});

module.exports = router;
