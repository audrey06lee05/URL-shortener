// urlController.js — translates HTTP requests into service calls and back.
// Holds no SQL and no business rules; that lives in urlService.js.
const urlService = require("../services/urlService");

// Create a new shortened URL (POST /api/urls)
async function createUrl(req, res) {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const newUrl = await urlService.createShortUrl({
      originalUrl,
      customAlias,
      expiresAt,
    });
    res.status(201).json(newUrl);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Something went wrong" });
  }
}

module.exports = { createUrl };
