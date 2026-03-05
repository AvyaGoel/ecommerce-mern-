const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, updateUserRole, toggleUserStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
