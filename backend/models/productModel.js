const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  discountedPrice: { type: Number, min: 0 },
  category: { type: String, required: [true, 'Category is required'], trim: true },
  brand: { type: String, default: '' },
  images: [{ public_id: String, url: String }],
  stock: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  sold: { type: Number, default: 0 },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  isActive: { type: Boolean, default: true },
  tags: [String],
}, { timestamps: true });

productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold && this.stock > 0;
});

productSchema.virtual('isOutOfStock').get(function () {
  return this.stock === 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
