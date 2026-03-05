const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/orderModel');
const ErrorHandler = require('../utils/errorHandler');

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new ErrorHandler('Razorpay credentials not configured', 500);
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return next(new ErrorHandler('Order not found', 404));

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalPrice * 100),
      currency: 'INR',
      receipt: `order_${orderId}`,
    });

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) { next(error); }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return next(new ErrorHandler('Invalid payment signature', 400));
    }

    const order = await Order.findById(orderId);
    if (!order) return next(new ErrorHandler('Order not found', 404));

    order.isPaid = true;
    order.paidAt = Date.now();
    order.orderStatus = 'Processing';
    order.paymentResult = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: 'paid',
      paid_at: new Date(),
    };
    order.statusHistory.push({ status: 'Processing', note: 'Payment verified' });

    await order.save();
    res.json({ success: true, message: 'Payment verified successfully', order });
  } catch (error) { next(error); }
};

exports.getRazorpayKey = async (req, res) => {
  res.json({ success: true, keyId: process.env.RAZORPAY_KEY_ID });
};
