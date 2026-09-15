// urlRoutes.js — maps HTTP verb + path to a controller function.
// Mounted at /api/urls in app.js, so this file's "/" is really "/api/urls".
const express = require("express");
const router = express.Router();
const { createUrl } = require("../controllers/urlController");
const { validateCreateUrl } = require("../middleware/validateUrl");

// Create a shortened URL
router.post("/", validateCreateUrl, createUrl);

module.exports = router;
