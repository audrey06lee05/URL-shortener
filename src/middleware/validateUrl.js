// validateUrl.js — rejects bad requests before they reach the controller,
// so the controller can assume originalUrl is already a valid http/https URL.

// Runs before POST /api/urls
function validateCreateUrl(req, res, next) {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: "originalUrl is required" });
  }

  try {
    const parsed = new URL(originalUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
  } catch {
    // new URL() throws on anything that isn't a well-formed URL at all
    return res
      .status(400)
      .json({ error: "originalUrl must be a valid http or https URL" });
  }

  next();
}

module.exports = { validateCreateUrl };
