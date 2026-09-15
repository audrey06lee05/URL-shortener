// urlController.js — translates HTTP requests into service calls and back.
// Holds no SQL and no business rules; that lives in urlService.js.
// Error cases throw instead of responding directly — Express 5 forwards
// a thrown/rejected error from an async handler to errorHandler.js.
const urlService = require("../services/urlService");

// Create a new shortened URL (POST /api/urls)
async function createUrl(req, res) {
  const { originalUrl, customAlias, expiresAt } = req.body;
  const newUrl = await urlService.createShortUrl({ originalUrl, customAlias, expiresAt });
  res.status(201).json(newUrl);
}

// Look up a short code, record the visit, and redirect (GET /:shortCode)
async function redirectToUrl(req, res) {
  const { shortCode } = req.params;
  const url = await urlService.getUrlByShortCode(shortCode);

  if (!url) {
    const err = new Error("Short URL not found");
    err.status = 404;
    throw err;
  }

  if (url.expires_at && new Date(url.expires_at) < new Date()) {
    const err = new Error("This short URL has expired");
    err.status = 410;
    throw err;
  }

  await urlService.recordClick(url.id, {
    referrer: req.get("Referrer"),
    userAgent: req.get("User-Agent"),
  });

  res.redirect(url.original_url);
}

// List all shortened URLs (GET /api/urls)
async function listUrls(req, res) {
  const urls = await urlService.getAllUrls();
  res.json(urls);
}

// Get one shortened URL by id (GET /api/urls/:id) — req.id set by validateId middleware
async function getUrl(req, res) {
  const url = await urlService.getUrlById(req.id);
  if (!url) {
    const err = new Error("URL not found");
    err.status = 404;
    throw err;
  }
  res.json(url);
}

// Delete one shortened URL by id (DELETE /api/urls/:id)
async function deleteUrl(req, res) {
  const deleted = await urlService.deleteUrlById(req.id);
  if (!deleted) {
    const err = new Error("URL not found");
    err.status = 404;
    throw err;
  }
  res.status(204).send();
}

// Return click analytics for one url (GET /api/urls/:id/analytics)
async function getAnalytics(req, res) {
  const url = await urlService.getUrlById(req.id);
  if (!url) {
    const err = new Error("URL not found");
    err.status = 404;
    throw err;
  }
  const analytics = await urlService.getUrlAnalytics(req.id);
  res.json({ urlId: req.id, shortCode: url.short_code, ...analytics });
}

module.exports = { createUrl, redirectToUrl, listUrls, getUrl, deleteUrl, getAnalytics };
