// validateId.js — parses :id from the URL into a number and rejects it
// early (400) if it's not a valid integer, so controllers can trust req.id.
const httpError = require("../utils/httpError");

function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return next(httpError(400, "id must be a number"));
  }
  req.id = id;
  next();
}

module.exports = validateId;
