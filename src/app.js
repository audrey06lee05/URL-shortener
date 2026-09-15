require("dotenv").config();
const express = require("express");
const pool = require("./db/db");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/db-health", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ dbTime: result.rows[0].now });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
