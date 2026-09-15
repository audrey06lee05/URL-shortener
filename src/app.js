// app.js — Express entry point for the URL Shortener + Click Analytics API.
// Sets up the app, mounts the /api/urls routes, and exposes two standalone
// health-check routes plus the top-level short-code redirect route.
// The error handler is registered last, so it catches errors from
// every route defined above it.

require("dotenv").config();
const express = require("express");
const pool = require("./db/db");
const urlRoutes = require("./routes/urlRoutes");
const { redirectToUrl } = require("./controllers/urlController");
const errorHandler = require("./middleware/errorHandler");

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

// Catch-all: matches any single-segment path as a short code, so it must
// stay registered last — otherwise it would shadow /health, /db-health,
// and /api/urls above it
app.get("/:shortCode", redirectToUrl);

app.use(errorHandler); // must be last — catches errors from every route above

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
