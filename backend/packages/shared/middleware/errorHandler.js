const AppError = require('../errors/AppError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  // Log error (can be structured logging later)
  console.error(`[Error] ${error.errorCode} - ${error.message}`, err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new AppError('Resource not found', 404, 'NOT_FOUND');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = new AppError('Duplicate field value entered', 409, 'CONFLICT');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 422, 'VALIDATION_ERROR', err.errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
  }

  res.status(error.statusCode).json({
    success: false,
    errorCode: error.errorCode,
    message: error.message,
    requestId: req.headers['x-request-id'] || req.id || null, // Assuming we generate requestId later
    ...(error.details && process.env.NODE_ENV !== 'production' && { details: error.details })
  });
};

module.exports = errorHandler;
