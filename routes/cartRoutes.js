const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { addToCart, getCartProducts, removeFromCart } = require('../controllers/cartController');


router.post('/add', authenticate, addToCart);

router.get('/products', authenticate, getCartProducts);


router.post('/remove', authenticate, removeFromCart);

module.exports = router;

