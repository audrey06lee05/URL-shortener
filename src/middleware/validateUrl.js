// validateUrl.js — rejects bad requests before they reach the controller,
// so the controller can assume originalUrl is already a valid http/https URL.

// Runs before POST /api/urls
function validateCreateUrl(req, res, next) {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    const err = new Error("originalUrl is required");
    err.status = 400;
    return next(err);
  }

  try {
    const parsed = new URL(originalUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
  } catch {
    const err = new Error("originalUrl must be a valid http or https URL");
    err.status = 400;
    return next(err);
  }

  next();
}

module.exports = { validateCreateUrl };
