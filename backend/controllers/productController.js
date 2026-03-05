const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const APIFeatures = require('../utils/apiFeatures');
const { cloudinary } = require('../config/cloudinary');

exports.getProducts = async (req, res, next) => {
  try {
    const resPerPage = Number(req.query.limit) || 12;
    const totalProducts = await Product.countDocuments({ isActive: true });

    const features = new APIFeatures(Product.find({ isActive: true }), req.query)
      .search()
      .filter()
      .sort()
      .paginate(resPerPage);

    const products = await features.query;

    res.json({
      success: true,
      count: products.length,
      total: totalProducts,
      resPerPage,
      products,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
    if (!product || !product.isActive) return next(new ErrorHandler('Product not found', 404));
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, discountedPrice, category, brand, stock, lowStockThreshold, tags } = req.body;
    
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({ public_id: file.filename, url: file.path });
      });
    }

    const product = await Product.create({
      name, description, price: Number(price),
      discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
      category, brand, stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold) || 10,
      images,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler('Product not found', 404));

    const updateData = { ...req.body };
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.stock) updateData.stock = Number(updateData.stock);
    if (updateData.discountedPrice) updateData.discountedPrice = Number(updateData.discountedPrice);

    if (req.files && req.files.length > 0) {
      for (const img of product.images) {
        if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
      }
      updateData.images = req.files.map((file) => ({ public_id: file.filename, url: file.path }));
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler('Product not found', 404));

    for (const img of product.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler('Product not found', 404));

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment;
    } else {
      product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    }

    product.numReviews = product.reviews.length;
    product.ratings = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.json({ success: true, message: 'Review submitted' });
  } catch (error) {
    next(error);
  }
};

exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
    }).select('name stock lowStockThreshold category');

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};
