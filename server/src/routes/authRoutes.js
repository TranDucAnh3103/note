const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares');
const { body } = require('express-validator');

const router = express.Router();

router.post('/send-otp', 
  body('email').isEmail().withMessage('Please provide a valid email'),
  authController.sendOtp
);

router.post('/register', 
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('otp').notEmpty().withMessage('OTP is required'),
  authController.register
);

router.post('/login',
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  authController.login
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);

router.post('/google', authController.googleLogin);
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateMe);
router.delete('/me', protect, authController.deleteAccount);
router.post('/google/link', protect, authController.linkGoogle);
router.get('/users', protect, authController.getUsers);
router.put('/users/:id', protect, authController.updateUser);

module.exports = router;
