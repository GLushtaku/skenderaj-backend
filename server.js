const express = require("express");
const cors = require("cors");
require("dotenv").config();

const placeRoutes = require("./routes/places");
const uploadRoutes = require("./routes/upload");

const app = express();
app.use(cors());
app.use(express.json());

// Root route handler
app.get("/", (req, res) => {
  res.json({ message: "OK", status: "Server is running" });
});

// Note: Run migrations manually with: npm run migrate
// This ensures database schema is up to date

app.use("/api/places", placeRoutes);
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
