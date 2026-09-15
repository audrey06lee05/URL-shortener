// httpError.js — builds an Error with a `status` property attached, so a
// route or middleware can throw/next() it and errorHandler.js picks up the
// right HTTP status instead of always defaulting to 500. Pulled out because
// the "new Error(); err.status = ...; throw/next" pattern was repeated
// six times across the controller, service, and validators.
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = httpError;
