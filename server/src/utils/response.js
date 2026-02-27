/**
 * Send success response
 */
exports.sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

/**
 * Send error response
 */
exports.sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

/**
 * Send validation error response
 */
exports.sendValidationError = (res, errors) => {
  res.status(422).json({
    success: false,
    error: 'Validation Error',
    errors,
  });
};
