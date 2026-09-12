/**
 * Global centralized error handling middleware.
 * Ensures consistent JSON responses and protects internal stack traces in production.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.originalUrl} - Status: ${statusCode} - ${message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Detect internal Prisma or database connection failures
  const isDbError =
    err.name?.includes('Prisma') ||
    (typeof message === 'string' && (
      message.includes('prisma') ||
      message.includes('database server') ||
      message.includes('neon.tech') ||
      message.includes('invocation') ||
      message.includes("Can't reach")
    ));

  // Mask internal 500 and database errors from the client
  let clientMessage = message;
  if (statusCode >= 500 || isDbError) {
    clientMessage = 'Service is temporarily unavailable. Please try again shortly.';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: clientMessage,
      statusCode,
      ...(process.env.NODE_ENV !== 'production' && !isDbError && { stack: err.stack })
    }
  });
};
