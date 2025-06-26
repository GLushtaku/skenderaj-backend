const { Pool } = require("pg");
require("dotenv").config();

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
console.log("NODE_ENV:", process.env.NODE_ENV);

// Use Railway's DATABASE_URL or fallback for development
const connectionString =
  process.env.DATABASE_URL || "postgresql://localhost:5432/skenderaj_db";

// Log the connection string (without password for security)
const safeConnectionString = connectionString.replace(
  /\/\/[^:]+:[^@]+@/,
  "//***:***@"
);
console.log("Using connection string:", safeConnectionString);

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test the connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
    console.error("Error code:", err.code);
  } else {
    console.log("✅ PostgreSQL Connected");
  }
});

module.exports = pool;
