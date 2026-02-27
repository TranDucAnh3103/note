const { validationResult } = require('express-validator');
const { sendValidationError } = require('../utils/response');

/**
 * Middleware to validate request using express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return sendValidationError(res, extractedErrors);
  }

  next();
};

module.exports = validate;
