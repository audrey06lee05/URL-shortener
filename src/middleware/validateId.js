// validateId.js — parses :id from the URL into a number and rejects it
// early (400) if it's not a valid integer, so controllers can trust req.id.
function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    const err = new Error("id must be a number");
    err.status = 400;
    return next(err);
  }
  req.id = id;
  next();
}

module.exports = validateId;
