const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateMe);
router.delete('/me', protect, authController.deleteAccount);
router.post('/google/link', protect, authController.linkGoogle);
router.get('/users', protect, authController.getUsers);
router.put('/users/:id', protect, authController.updateUser);

module.exports = router;
