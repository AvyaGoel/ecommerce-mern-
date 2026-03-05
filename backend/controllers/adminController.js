const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const ErrorHandler = require('../utils/errorHandler');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalOrders, totalProducts, orders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.find().select('totalPrice createdAt orderStatus'),
    ]);

    const totalRevenue = orders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    // Monthly revenue for last 12 months
    const now = new Date();
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthOrders = orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end && o.orderStatus !== 'Cancelled';
      });
      monthlyRevenue.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: monthOrders.reduce((sum, o) => sum + o.totalPrice, 0),
        orders: monthOrders.length,
      });
    }

    // Best selling products
    const bestSelling = await Product.find({ isActive: true })
      .sort('-sold')
      .limit(5)
      .select('name sold price images category');

    // Order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    // Low stock count
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        lowStockCount,
      },
      monthlyRevenue,
      bestSelling,
      orderStatusBreakdown,
    });
  } catch (error) { next(error); }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const query = req.query.search
      ? { $or: [{ name: { $regex: req.query.search, $options: 'i' } }, { email: { $regex: req.query.search, $options: 'i' } }] }
      : {};
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit).sort('-createdAt'),
      User.countDocuments(query),
    ]);
    res.json({ success: true, users, total });
  } catch (error) { next(error); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!user) return next(new ErrorHandler('User not found', 404));
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler('User not found', 404));
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (error) { next(error); }
};
