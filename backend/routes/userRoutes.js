const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, addAddress, deleteAddress } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/addresses', addAddress);
router.delete('/addresses/:id', deleteAddress);

module.exports = router;
