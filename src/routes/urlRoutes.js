// urlRoutes.js — maps HTTP verb + path to a controller function.
// Mounted at /api/urls in app.js, so this file's "/" is really "/api/urls".
const express = require("express");
const router = express.Router();
const {
  createUrl,
  listUrls,
  getUrl,
  deleteUrl,
  getAnalytics,
} = require("../controllers/urlController");
const { validateCreateUrl } = require("../middleware/validateUrl");
const validateId = require("../middleware/validateId");

// Create a shortened URL
router.post("/", validateCreateUrl, createUrl);

// List all shortened URLs
router.get("/", listUrls);

// Get one shortened URL by id
router.get("/:id", validateId, getUrl);

// Delete one shortened URL by id
router.delete("/:id", validateId, deleteUrl);

// Get click analytics for one shortened URL
router.get("/:id/analytics", validateId, getAnalytics);

module.exports = router;
