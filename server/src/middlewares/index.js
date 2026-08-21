const errorHandler = require('./errorHandler');
const validate = require('./validate');
const { limiter, authLimiter } = require('./rateLimiter');
const sanitize = require('./sanitize');
const asyncHandler = require('./asyncHandler');

const auth = require('./auth');

module.exports = {
  errorHandler,
  validate,
  limiter,
  authLimiter,
  sanitize,
  asyncHandler,
  protect: auth.protect,
  authorize: auth.authorize,
};
