exports.up = async (pool) => {
  try {
    // Create places table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS places (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        historical_significance TEXT NOT NULL,
        image_url TEXT NOT NULL,
        images TEXT[] DEFAULT '{}',
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        slug VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Places table created successfully");
  } catch (error) {
    console.error("❌ Error creating places table:", error);
    throw error;
  }
};

exports.down = async (pool) => {
  try {
    await pool.query("DROP TABLE IF EXISTS places CASCADE");
    console.log("✅ Places table dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping places table:", error);
    throw error;
  }
};
