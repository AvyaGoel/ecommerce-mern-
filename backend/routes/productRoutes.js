const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getCategories, createProduct, updateProduct, deleteProduct, createReview, getLowStockProducts } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/low-stock', protect, authorize('admin'), getLowStockProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('admin'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/review', protect, createReview);

module.exports = router;
