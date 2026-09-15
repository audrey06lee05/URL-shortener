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

// Look up a short code, record the visit, and redirect (GET /:shortCode)
async function redirectToUrl(req, res) {
  const { shortCode } = req.params;
  const url = await urlService.getUrlByShortCode(shortCode);

  if (!url) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  if (url.expires_at && new Date(url.expires_at) < new Date()) {
    return res.status(410).json({ error: "This short URL has expired" });
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

// Get one shortened URL by id (GET /api/urls/:id)
async function getUrl(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  const url = await urlService.getUrlById(id);
  if (!url) {
    return res.status(404).json({ error: "URL not found" });
  }

  res.json(url);
}

// Delete one shortened URL by id (DELETE /api/urls/:id)
async function deleteUrl(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  const deleted = await urlService.deleteUrlById(id);
  if (!deleted) {
    return res.status(404).json({ error: "URL not found" });
  }

  res.status(204).send();
}

module.exports = { createUrl, redirectToUrl, listUrls, getUrl, deleteUrl };
