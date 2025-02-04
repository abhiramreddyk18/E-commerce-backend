const express = require('express');
const { addToCart, getCartProducts } = require('../controllers/cartController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', authenticate, addToCart);
router.get('/products', authenticate, getCartProducts);

module.exports = router;
