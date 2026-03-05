const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock isActive');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json({ success: true, cart });
  } catch (error) { next(error); }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) return next(new ErrorHandler('Product not found', 404));
    if (product.stock < quantity) return next(new ErrorHandler(`Only ${product.stock} items in stock`, 400));

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) return next(new ErrorHandler(`Only ${product.stock} items available`, 400));
      existingItem.quantity = newQty;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.discountedPrice || product.price,
        name: product.name,
        image: product.images[0]?.url || '',
      });
    }

    cart.calculateTotals();
    await cart.save();
    await cart.populate('items.product', 'name images price stock isActive');
    res.json({ success: true, cart });
  } catch (error) { next(error); }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return next(new ErrorHandler('Product not found', 404));
    if (quantity > product.stock) return next(new ErrorHandler(`Only ${product.stock} items available`, 400));

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return next(new ErrorHandler('Cart not found', 404));

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) return next(new ErrorHandler('Item not in cart', 404));

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    } else {
      item.quantity = quantity;
    }

    cart.calculateTotals();
    await cart.save();
    await cart.populate('items.product', 'name images price stock isActive');
    res.json({ success: true, cart });
  } catch (error) { next(error); }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return next(new ErrorHandler('Cart not found', 404));

    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    cart.calculateTotals();
    await cart.save();
    await cart.populate('items.product', 'name images price stock isActive');
    res.json({ success: true, cart });
  } catch (error) { next(error); }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) { cart.items = []; cart.calculateTotals(); await cart.save(); }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) { next(error); }
};
