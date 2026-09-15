// urlService.js — business logic for creating shortened URLs: picks a
// short_code (custom alias or random), checks it's free, and saves the row.
// This is the only file that runs SQL for URL creation.
const pool = require("../db/db");
const generateShortCode = require("../utils/generateShortCode");

// Build and save a new urls row, returns the inserted row
async function createShortUrl({ originalUrl, customAlias, expiresAt }) {
  let shortCode = customAlias;

  if (shortCode) {
    // Custom alias — must not already be taken
    const existing = await pool.query(
      "SELECT id FROM urls WHERE short_code = $1",
      [shortCode],
    );
    if (existing.rows.length > 0) {
      const err = new Error("Custom alias already in use");
      err.status = 409;
      throw err;
    }
  } else {
    // No alias — keep generating random codes until one isn't taken
    let isUnique = false;
    while (!isUnique) {
      shortCode = generateShortCode();
      const existing = await pool.query(
        "SELECT id FROM urls WHERE short_code = $1",
        [shortCode],
      );
      isUnique = existing.rows.length === 0;
    }
  }

  const result = await pool.query(
    `INSERT INTO urls (original_url, short_code, expires_at) VALUES ($1, $2, $3) RETURNING *`,
    [originalUrl, shortCode, expiresAt || null],
  );

  return result.rows[0];
}

module.exports = { createShortUrl };
