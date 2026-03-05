const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(new ErrorHandler('Not authorized, no token', 401));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new ErrorHandler('User not found', 401));
    if (!user.isActive) return next(new ErrorHandler('Account is deactivated', 401));

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return next(new ErrorHandler('Token expired', 401));
    return next(new ErrorHandler('Not authorized', 401));
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role '${req.user.role}' is not authorized`, 403));
    }
    next();
  };
};
