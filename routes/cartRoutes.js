const express = require('express');
const router = express.Router();
const { addToCart, getCartProducts, removeFromCart } = require('../controllers/cartController');


router.post('/add', addToCart);

router.get('/products', getCartProducts);


router.post('/remove', removeFromCart);

module.exports = router;

