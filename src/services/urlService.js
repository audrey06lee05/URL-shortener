// urlService.js — business logic for creating shortened URLs: picks a
// short_code (custom alias or random), checks it's free, and saves the row.
// This is the only file that runs SQL for URL creation.
const pool = require("../db/db");
const generateShortCode = require("../utils/generateShortCode");
const httpError = require("../utils/httpError");

// Shared by both branches below (custom alias and random generation) —
// was two copies of the same "SELECT id FROM urls WHERE short_code = $1"
// query before this was pulled out
async function isShortCodeTaken(shortCode) {
  const existing = await pool.query(
    "SELECT id FROM urls WHERE short_code = $1",
    [shortCode],
  );
  return existing.rows.length > 0;
}

// Build and save a new urls row, returns the inserted row
async function createShortUrl({ originalUrl, customAlias, expiresAt }) {
  let shortCode = customAlias;

  if (shortCode) {
    // Custom alias — must not already be taken
    if (await isShortCodeTaken(shortCode)) {
      throw httpError(409, "Custom alias already in use");
    }
  } else {
    // No alias — keep generating random codes until one isn't taken
    do {
      shortCode = generateShortCode();
    } while (await isShortCodeTaken(shortCode));
  }

  const result = await pool.query(
    `INSERT INTO urls (original_url, short_code, expires_at) VALUES ($1, $2, $3) RETURNING *`,
    [originalUrl, shortCode, expiresAt || null],
  );

  return result.rows[0];
}

// Look up a url by its short_code, to redirect (GET /:shortCode)
async function getUrlByShortCode(shortCode) {
  const result = await pool.query("SELECT * FROM urls WHERE short_code = $1", [
    shortCode,
  ]);
  return result.rows[0]; // undefined if no match
}

// Record one visit to a url, right before redirecting (part of GET /:shortCode)
async function recordClick(urlId, { referrer, userAgent }) {
  await pool.query(
    "INSERT INTO clicks (url_id, clicked_at, referrer, user_agent) VALUES ($1, NOW(), $2, $3)",
    [urlId, referrer || null, userAgent || null],
  );
}

// List all urls with each one's click count, newest first (GET /api/urls)
async function getAllUrls() {
  const result = await pool.query(`
    SELECT u.*, COUNT(c.id) AS click_count
    FROM urls u
    LEFT JOIN clicks c ON c.url_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);
  return result.rows;
}

// Get one url by id (GET /api/urls/:id)
async function getUrlById(id) {
  const result = await pool.query("SELECT * FROM urls WHERE id = $1", [id]);
  return result.rows[0]; // undefined if no match
}

// Delete one url by id, returns the deleted row (DELETE /api/urls/:id)
async function deleteUrlById(id) {
  const result = await pool.query(
    "DELETE FROM urls WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0]; // undefined if nothing was deleted
}

// Get click analytics for one url: total clicks, last click, clicks per day (GET /api/urls/:id/analytics)
async function getUrlAnalytics(urlId) {
  const totals = await pool.query(
    "SELECT COUNT(*) AS total_clicks, MAX(clicked_at) AS last_click FROM clicks WHERE url_id = $1",
    [urlId],
  );

  const byDay = await pool.query(
    `SELECT DATE(clicked_at) AS day, COUNT(*) AS count
     FROM clicks
     WHERE url_id = $1
     GROUP BY DATE(clicked_at)
     ORDER BY day ASC`,
    [urlId],
  );

  return {
    totalClicks: Number(totals.rows[0].total_clicks),
    lastClick: totals.rows[0].last_click,
    clicksByDay: byDay.rows,
  };
}

module.exports = {
  createShortUrl,
  getUrlByShortCode,
  recordClick,
  getAllUrls,
  getUrlById,
  deleteUrlById,
  getUrlAnalytics,
};
