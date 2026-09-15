// errorHandler.js — centralized error handler. Every error thrown or
// passed to next() anywhere in the app ends up here instead of each
// route building its own error response. Must be registered last in
// app.js, after every route, and must keep all 4 params even though
// next is unused — that 4-parameter signature is how Express recognizes
// this as error-handling middleware rather than a normal route.
function errorHandler(err, req, res, next) {
  console.error(err); // full error + stack stays in the server log only

  const status = err.status || 500;
  const message = status === 500 ? "Something went wrong" : err.message;

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
