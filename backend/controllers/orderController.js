const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const ErrorHandler = require('../utils/errorHandler');

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return next(new ErrorHandler('Cart is empty', 400));

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive) return next(new ErrorHandler(`Product ${item.name} is unavailable`, 400));
      if (product.stock < item.quantity) return next(new ErrorHandler(`Insufficient stock for ${product.name}`, 400));
    }

    const itemsPrice = cart.totalPrice;
    const shippingPrice = itemsPrice > 999 ? 0 : 99;
    const taxPrice = Number((0.18 * itemsPrice).toFixed(2));
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0]?.url || '',
      price: item.price,
      quantity: item.quantity,
    }));

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      statusHistory: [{ status: 'Pending', note: 'Order placed' }],
    });

    // Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    // Clear cart
    cart.items = [];
    cart.calculateTotals();
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (error) { next(error); }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, orders });
  } catch (error) { next(error); }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return next(new ErrorHandler('Order not found', 404));
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorHandler('Not authorized', 403));
    }
    res.json({ success: true, order });
  } catch (error) { next(error); }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.orderStatus = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(query).populate('user', 'name email').sort('-createdAt').skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    res.json({ success: true, orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ErrorHandler('Order not found', 404));

    order.orderStatus = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) { next(error); }
};
