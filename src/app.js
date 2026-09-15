// app.js — Express entry point for the URL Shortener + Click Analytics API.
// Sets up the app, mounts the /api/urls routes, and exposes two standalone
// health-check routes used only to confirm the server (and separately,
// the database) are reachable.

require("dotenv").config();
const express = require("express");
const pool = require("./db/db");
const urlRoutes = require("./routes/urlRoutes");

const app = express();
app.use(express.json()); // parse incoming JSON bodies — must come before any route that reads req.body

app.use("/api/urls", urlRoutes);

// Sanity check — confirms the server process is running
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Sanity check — confirms Node can reach PostgreSQL
app.get("/db-health", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ dbTime: result.rows[0].now });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
