const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const OTP = require('../models/OTP');
const { asyncHandler } = require('../middlewares');
const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { validationResult } = require('express-validator');
const sendEmail = require('../services/emailService');

// Get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
  // Create access token
  const token = jwt.sign({ id: user._id }, config.jwtSecret, {
    expiresIn: '1h',
  });

  // Create refresh token
  const refreshToken = jwt.sign({ id: user._id }, config.jwtRefreshSecret, {
    expiresIn: '7d',
  });

  // Save refresh token to db
  await RefreshToken.create({
    token: refreshToken,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    }
  });
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(errors.array()[0].msg, 400));
  }

  const { email } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError('Email already exists', 400));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

  // Delete any existing OTP for this email
  await OTP.deleteMany({ email });

  await OTP.create({
    email,
    otp
  });

  const message = `Mã OTP xác thực của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`;

  try {
    await sendEmail({
      email,
      subject: 'Mã OTP xác thực đăng ký',
      message
    });

    res.status(200).json({ success: true, message: 'Mã OTP đã được gửi về email của bạn' });
  } catch (err) {
    console.log(err);
    return next(new ApiError('Không thể gửi email OTP', 500));
  }
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(errors.array()[0].msg, 400));
  }

  const { username, email, password, otp } = req.body;

  // Verify OTP
  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    return next(new ApiError('Mã OTP không hợp lệ hoặc đã hết hạn', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  
  if (existingUser) {
    return next(new ApiError('Email or username already exists', 400));
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
  });

  // Delete OTP after successful registration
  await OTP.deleteMany({ email });

  // Create default folders
  const Folder = require('../models/Folder');
  const defaultFolders = [
    { name: 'Công việc', color: '#ef4444', userId: user._id, order: 0 },
    { name: 'Game', color: '#8b5cf6', userId: user._id, order: 1 },
    { name: 'Cá nhân', color: '#10b981', userId: user._id, order: 2 },
    { name: 'Tài chính', color: '#f59e0b', userId: user._id, order: 3 },
    { name: 'Học tập', color: '#3b82f6', userId: user._id, order: 4 }
  ];
  await Folder.insertMany(defaultFolders);

  await sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(errors.array()[0].msg, 400));
  }

  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ApiError('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ApiError('Invalid credentials', 401));
  }

  if (user.status === 'BLOCKED') {
    return next(new ApiError('Your account has been blocked', 403));
  }

  await sendTokenResponse(user, 200, res);
});

// @desc    Refresh Token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ApiError('Refresh token is required', 400));
  }

  // Find token in db
  const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
  if (!tokenDoc) {
    return next(new ApiError('Invalid refresh token', 401));
  }

  // Verify token
  try {
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError('User no longer exists', 401));
    }

    if (user.status === 'BLOCKED') {
      return next(new ApiError('Your account has been blocked', 403));
    }

    // Generate new access token
    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: '1h',
    });

    res.status(200).json({
      success: true,
      token
    });
  } catch (err) {
    await RefreshToken.deleteOne({ token: refreshToken });
    return next(new ApiError('Refresh token expired', 401));
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(config.google.clientId);

// @desc    Login with Google
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = asyncHandler(async (req, res, next) => {
  const { credential } = req.body;
  if (!credential) {
    return next(new ApiError('No Google credential provided', 400));
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: config.google.clientId,
  });

  const payload = ticket.getPayload();
  const { email, name, sub: googleId } = payload;

  let user = await User.findOne({ email });

  if (user) {
    if (user.status === 'BLOCKED') {
      return next(new ApiError('Your account has been blocked', 403));
    }
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    // Create new user without password (since it's optional now)
    user = await User.create({
      username: name,
      email,
      googleId
    });

    // Create default folders
    const Folder = require('../models/Folder');
    const defaultFolders = [
      { name: 'Công việc', color: '#ef4444', userId: user._id, order: 0 },
      { name: 'Game', color: '#8b5cf6', userId: user._id, order: 1 },
      { name: 'Cá nhân', color: '#10b981', userId: user._id, order: 2 },
      { name: 'Tài chính', color: '#f59e0b', userId: user._id, order: 3 },
      { name: 'Học tập', color: '#3b82f6', userId: user._id, order: 4 }
    ];
    await Folder.insertMany(defaultFolders);
  }

  await sendTokenResponse(user, 200, res);
});

// @desc    Update user AI config
// @route   PUT /api/auth/me
// @access  Private
exports.updateMe = asyncHandler(async (req, res, next) => {
  const { aiConfig } = req.body;
  const user = await User.findById(req.user._id);
  
  if (aiConfig) {
    user.aiConfig = {
      provider: aiConfig.provider || user.aiConfig?.provider || 'default',
      apiKey: aiConfig.apiKey !== undefined ? aiConfig.apiKey : user.aiConfig?.apiKey,
      model: aiConfig.model !== undefined ? aiConfig.model : user.aiConfig?.model
    };
    await user.save();
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});
// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ApiError('Not authorized to access this route', 403));
  }
  const users = await User.find({}).select('-password');
  res.status(200).json({
    success: true,
    data: users,
  });
});

// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ApiError('Not authorized to access this route', 403));
  }
  
  const user = await User.findById(req.params.id);
  
  if (req.user._id.toString() === req.params.id && req.body.role && req.body.role !== 'admin') {
    const ApiError = require('../utils/ApiError');
    return next(new ApiError('Bạn không thể tự tước quyền Admin của chính mình!', 403));
  }
  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  const { role, status } = req.body;
  if (role) user.role = role;
  if (status) user.status = status;

  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.linkGoogle = asyncHandler(async (req, res, next) => {
  const { credential } = req.body;
  if (!credential) return next(new ApiError('No Google credential provided', 400));

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: config.google.clientId,
  });

  const payload = ticket.getPayload();
  const { sub: googleId } = payload;

  const user = await User.findById(req.user._id);
  if (!user) return next(new ApiError('User not found', 404));

  user.googleId = googleId;
  await user.save();

  res.status(200).json({ success: true, data: user });
});

exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user._id.toString();
  
  // Verify password if user has no googleId
  const user = await User.findById(userId).select('+password');
  if (!user.googleId) {
    if (!req.body.password) {
      return next(new ApiError('Password is required to delete account', 400));
    }
    const isMatch = await user.matchPassword(req.body.password);
    if (!isMatch) {
      return next(new ApiError('Incorrect password', 401));
    }
  }

  // Delete all user data
  const Note = require('../models/Note');
  const Folder = require('../models/Folder');
  
  await Note.deleteMany({ userId });
  await Folder.deleteMany({ userId });
  await User.findByIdAndDelete(userId);

  // Delete vectors
  const embeddingService = require('../services/embeddingService');
  try {
    const { pool } = require('../config/supabase');
    const dbClient = await pool.connect();
    await dbClient.query('DELETE FROM note_embeddings WHERE user_id = $1', [userId]);
    dbClient.release();
  } catch (err) {
    console.error('Failed to delete vectors:', err.message);
  }

  res.status(200).json({ success: true, message: 'Account deleted' });
});
