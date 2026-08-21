const User = require('../models/User');
const { asyncHandler } = require('../middlewares');
const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, config.jwtSecret, {
    expiresIn: '30d',
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

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

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ApiError('Please provide an email and password', 400));
  }

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

  sendTokenResponse(user, 200, res);
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

  sendTokenResponse(user, 200, res);
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
