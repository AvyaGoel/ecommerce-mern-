const express = require('express');
const router = express.Router();
const { register, login, logout, refreshToken, forgotPassword, resetPassword, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
