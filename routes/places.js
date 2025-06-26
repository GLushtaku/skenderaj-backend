const express = require("express");
const router = express.Router();
const pool = require("../config/database");
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

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Get all places
router.get("/", async (req, res) => {
  try {
    console.log("Attempting to fetch all places...");
    const result = await pool.query(
      "SELECT * FROM places ORDER BY created_at DESC"
    );
    console.log(`Found ${result.rows.length} places`);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get single place by ID
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM places WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendi nuk u gjet" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get place by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM places WHERE slug = $1", [
      req.params.slug,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendi nuk u gjet" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new place with image upload
router.post("/with-image", upload.single("image"), async (req, res) => {
  try {
    // Check if place with same name exists
    const existingPlace = await pool.query(
      "SELECT * FROM places WHERE name = $1",
      [req.body.name]
    );

    if (existingPlace.rows.length > 0) {
      return res.status(400).json({
        message: "Ekziston një vend me të njëjtin emër",
      });
    }

    let imageUrl = null;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const cloudinaryResult = await cloudinary.uploader.upload(dataURI, {
        folder: "skenderaj-places",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
        ],
      });
      imageUrl = cloudinaryResult.secure_url;
    }
    const slug = generateSlug(req.body.name);
    const result = await pool.query(
      `INSERT INTO places (name, description, location, historical_significance, image_url, latitude, longitude, slug) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        req.body.name,
        req.body.description,
        req.body.location,
        req.body.historicalSignificance,
        imageUrl || req.body.imageUrl,
        req.body.latitude || null,
        req.body.longitude || null,
        slug,
      ]
    );
    res.status(201).json({ message: "OK" });
  } catch (error) {
    console.error("Error creating place with image:", error);
    res.status(400).json({ message: error.message });
  }
});

// Create new place (without image upload)
router.post("/", async (req, res) => {
  try {
    const existingPlace = await pool.query(
      "SELECT * FROM places WHERE name = $1",
      [req.body.name]
    );
    if (existingPlace.rows.length > 0) {
      return res.status(400).json({
        message: "Ekziston një vend me të njëjtin emër",
      });
    }
    const slug = generateSlug(req.body.name);
    const result = await pool.query(
      `INSERT INTO places (name, description, location, historical_significance, image_url, latitude, longitude, slug) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        req.body.name,
        req.body.description,
        req.body.location,
        req.body.historicalSignificance,
        req.body.imageUrl,
        req.body.latitude || null,
        req.body.longitude || null,
        slug,
      ]
    );
    res.status(201).json({ message: "OK" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update place
router.patch("/:id", async (req, res) => {
  try {
    // Check if place exists
    const existingPlace = await pool.query(
      "SELECT * FROM places WHERE id = $1",
      [req.params.id]
    );

    if (existingPlace.rows.length === 0) {
      return res.status(404).json({ message: "Vendi nuk u gjet" });
    }

    // Check if new name conflicts with other places
    if (req.body.name) {
      const nameConflict = await pool.query(
        "SELECT * FROM places WHERE name = $1 AND id != $2",
        [req.body.name, req.params.id]
      );

      if (nameConflict.rows.length > 0) {
        return res.status(400).json({
          message: "Ekziston një vend tjetër me të njëjtin emër",
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (req.body.name) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(req.body.name);
      updateFields.push(`slug = $${paramCount++}`);
      values.push(generateSlug(req.body.name));
    }
    if (req.body.description) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(req.body.description);
    }
    if (req.body.location) {
      updateFields.push(`location = $${paramCount++}`);
      values.push(req.body.location);
    }
    if (req.body.historicalSignificance) {
      updateFields.push(`historical_significance = $${paramCount++}`);
      values.push(req.body.historicalSignificance);
    }
    if (req.body.imageUrl) {
      updateFields.push(`image_url = $${paramCount++}`);
      values.push(req.body.imageUrl);
    }
    if (req.body.latitude) {
      updateFields.push(`latitude = $${paramCount++}`);
      values.push(req.body.latitude);
    }
    if (req.body.longitude) {
      updateFields.push(`longitude = $${paramCount++}`);
      values.push(req.body.longitude);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE places SET ${updateFields.join(", ")} WHERE id = $${paramCount}`,
      values
    );

    res.json({ message: "OK" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update place with image upload
router.patch("/:id/with-image", upload.single("image"), async (req, res) => {
  try {
    // Check if place exists
    const existingPlace = await pool.query(
      "SELECT * FROM places WHERE id = $1",
      [req.params.id]
    );

    if (existingPlace.rows.length === 0) {
      return res.status(404).json({ message: "Vendi nuk u gjet" });
    }

    // Check if new name conflicts with other places
    if (req.body.name) {
      const nameConflict = await pool.query(
        "SELECT * FROM places WHERE name = $1 AND id != $2",
        [req.body.name, req.params.id]
      );

      if (nameConflict.rows.length > 0) {
        return res.status(400).json({
          message: "Ekziston një vend tjetër me të njëjtin emër",
        });
      }
    }

    let imageUrl = null;

    // Upload new image to Cloudinary if provided
    if (req.file) {
      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload to Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(dataURI, {
        folder: "skenderaj-places",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
        ],
      });

      imageUrl = cloudinaryResult.secure_url;
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (req.body.name) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(req.body.name);
      updateFields.push(`slug = $${paramCount++}`);
      values.push(generateSlug(req.body.name));
    }
    if (req.body.description) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(req.body.description);
    }
    if (req.body.location) {
      updateFields.push(`location = $${paramCount++}`);
      values.push(req.body.location);
    }
    if (req.body.historicalSignificance) {
      updateFields.push(`historical_significance = $${paramCount++}`);
      values.push(req.body.historicalSignificance);
    }
    if (imageUrl) {
      updateFields.push(`image_url = $${paramCount++}`);
      values.push(imageUrl);
    } else if (req.body.imageUrl) {
      updateFields.push(`image_url = $${paramCount++}`);
      values.push(req.body.imageUrl);
    }
    if (req.body.latitude) {
      updateFields.push(`latitude = $${paramCount++}`);
      values.push(req.body.latitude);
    }
    if (req.body.longitude) {
      updateFields.push(`longitude = $${paramCount++}`);
      values.push(req.body.longitude);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE places SET ${updateFields.join(", ")} WHERE id = $${paramCount}`,
      values
    );

    res.json({ message: "OK" });
  } catch (error) {
    console.error("Error updating place with image:", error);
    res.status(400).json({ message: error.message });
  }
});

// Delete place
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM places WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Vendi nuk u gjet" });
    }

    res.json({ message: "OK" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
