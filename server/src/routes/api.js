const express = require('express');
const { register, login } = require('../controllers/authController');
const {
    getCartItems,
    placeOrder,
    getTopRatedProducts,
    getOrderHistory,
    getProductsByCategory,
    addToWishList,
    getWishList,
    getProductSuppliers,
    addReview,
    getUserPayments,
    getLowStockProducts
} = require('../controllers/queryController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/top-rated', getTopRatedProducts);
router.get('/products/category/:category_id', getProductsByCategory);
router.get('/suppliers/:product_id', getProductSuppliers);
router.get('/low-stock', getLowStockProducts);

// Protected routes (require JWT)
router.get('/cart', authenticateToken, getCartItems);
router.post('/order', authenticateToken, placeOrder);
router.get('/orders', authenticateToken, getOrderHistory);
router.post('/wishlist', authenticateToken, addToWishList);
router.get('/wishlist', authenticateToken, getWishList);
router.post('/review', authenticateToken, addReview);
router.get('/payments', authenticateToken, getUserPayments);

module.exports = router;