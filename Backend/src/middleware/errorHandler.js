export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;

  // Log sanitized error server-side without dumping raw request headers/credentials
  console.error(`[API Error ${statusCode}] ${req.method} ${req.path}:`, err.message);

  // Never leak internal database / SQL exception messages on 500 errors to the client
  const safeClientMessage =
    statusCode >= 500
      ? 'An internal server error occurred. Please try again later.'
      : err.message || 'Request could not be processed.';

  res.status(statusCode).json({
    success: false,
    error: safeClientMessage
  });
}
