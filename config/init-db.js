const pool = require("./database");

const initDatabase = async () => {
  try {
    // Create places table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS places (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        historical_significance TEXT NOT NULL,
        image_url TEXT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        slug VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableQuery);

    // Add slug column if it doesn't exist (for existing tables)
    try {
      await pool.query(`
        ALTER TABLE places ADD COLUMN slug VARCHAR(255) UNIQUE;
      `);
      console.log("✅ Slug column added to existing table");
    } catch (error) {
      // Column already exists, ignore error
      console.log("ℹ️ Slug column already exists");
    }

    console.log("✅ Database tables initialized");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
  }
};

module.exports = initDatabase;
