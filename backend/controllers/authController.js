const crypto = require('crypto');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const ErrorHandler = require('../utils/errorHandler');
const { sendTokens, generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return next(new ErrorHandler('All fields required', 400));

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new ErrorHandler('Email already exists', 400));

    const user = await User.create({ name, email, password });
    await Cart.create({ user: user._id, items: [] });

    sendTokens(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new ErrorHandler('Email and password required', 400));

    const user = await User.findOne({ email }).select('+password');
    if (!user) return next(new ErrorHandler('Invalid credentials', 401));
    if (!user.isActive) return next(new ErrorHandler('Account deactivated', 401));

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(new ErrorHandler('Invalid credentials', 401));

    sendTokens(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie('refreshToken', '', { expires: new Date(0), httpOnly: true });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return next(new ErrorHandler('No refresh token', 401));

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new ErrorHandler('User not found', 401));

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    next(new ErrorHandler('Invalid refresh token', 401));
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new ErrorHandler('No user with that email', 404));

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
        <a href="${resetUrl}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none">Reset Password</a>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return next(new ErrorHandler('Invalid or expired reset token', 400));

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokens(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
