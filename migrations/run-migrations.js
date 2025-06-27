const pool = require("../config/database");
const fs = require("fs");
const path = require("path");

const createMigrationsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Migrations table created/verified");
  } catch (error) {
    console.error("❌ Error creating migrations table:", error);
  }
};

const getExecutedMigrations = async () => {
  try {
    const result = await pool.query("SELECT name FROM migrations ORDER BY id");
    return result.rows.map((row) => row.name);
  } catch (error) {
    console.error("❌ Error getting executed migrations:", error);
    return [];
  }
};

const markMigrationAsExecuted = async (migrationName) => {
  try {
    await pool.query("INSERT INTO migrations (name) VALUES ($1)", [
      migrationName,
    ]);
    console.log(`✅ Migration ${migrationName} marked as executed`);
  } catch (error) {
    console.error(
      `❌ Error marking migration ${migrationName} as executed:`,
      error
    );
  }
};

const runMigration = async (migrationPath) => {
  try {
    const migration = require(migrationPath);
    await migration.up(pool);
    return true;
  } catch (error) {
    console.error(`❌ Error running migration ${migrationPath}:`, error);
    return false;
  }
};

const runMigrations = async () => {
  try {
    console.log("🚀 Starting migrations...");

    // Create migrations table if it doesn't exist
    await createMigrationsTable();

    // Get list of migration files
    const migrationsDir = path.join(__dirname);
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".js") && file !== "run-migrations.js")
      .sort();

    // Get already executed migrations
    const executedMigrations = await getExecutedMigrations();

    console.log(`📋 Found ${migrationFiles.length} migration files`);
    console.log(`📋 Already executed: ${executedMigrations.length} migrations`);

    // Run pending migrations
    for (const migrationFile of migrationFiles) {
      if (!executedMigrations.includes(migrationFile)) {
        console.log(`🔄 Running migration: ${migrationFile}`);
        const migrationPath = path.join(migrationsDir, migrationFile);
        const success = await runMigration(migrationPath);

        if (success) {
          await markMigrationAsExecuted(migrationFile);
        } else {
          console.error(`❌ Migration ${migrationFile} failed, stopping...`);
          process.exit(1);
        }
      } else {
        console.log(`⏭️ Skipping already executed migration: ${migrationFile}`);
      }
    }

    console.log("✅ All migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration runner error:", error);
    process.exit(1);
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
