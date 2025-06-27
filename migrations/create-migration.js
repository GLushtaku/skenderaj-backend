const fs = require("fs");
const path = require("path");

const createMigration = (migrationName) => {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
  const fileName = `${timestamp}_${migrationName}.js`;
  const filePath = path.join(__dirname, fileName);

  const template = `exports.up = async (pool) => {
  try {
    // TODO: Add your migration logic here
    // Example:
    // await pool.query("ALTER TABLE places ADD COLUMN new_field VARCHAR(255)");
    
    console.log("✅ Migration ${migrationName} executed successfully");
  } catch (error) {
    console.error("❌ Error in migration ${migrationName}:", error);
    throw error;
  }
};

exports.down = async (pool) => {
  try {
    // TODO: Add rollback logic here
    // Example:
    // await pool.query("ALTER TABLE places DROP COLUMN new_field");
    
    console.log("✅ Migration ${migrationName} rolled back successfully");
  } catch (error) {
    console.error("❌ Error rolling back migration ${migrationName}:", error);
    throw error;
  }
};
`;

  fs.writeFileSync(filePath, template);
  console.log(`✅ Created migration file: ${fileName}`);
  console.log(`📝 Edit the file to add your migration logic`);
};

// Get migration name from command line arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.error("❌ Please provide a migration name");
  console.log("Usage: node create-migration.js <migration_name>");
  console.log("Example: node create-migration.js add_user_table");
  process.exit(1);
}

createMigration(migrationName);
