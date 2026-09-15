// validateUrl.js — rejects bad requests before they reach the controller,
// so the controller can assume originalUrl is already a valid http/https URL.
const httpError = require("../utils/httpError");

// Runs before POST /api/urls
function validateCreateUrl(req, res, next) {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return next(httpError(400, "originalUrl is required"));
  }

  try {
    const parsed = new URL(originalUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
  } catch {
    return next(httpError(400, "originalUrl must be a valid http or https URL"));
  }

  next();
}

module.exports = { validateCreateUrl };
