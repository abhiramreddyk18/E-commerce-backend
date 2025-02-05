const Cart = require('../models/Cart');

// Add to Cart
exports.addToCart = async (req, res) => {
    try {
        const { product_id, name, image, description, quantity, price, total } = req.body;
        let cart = await Cart.findOne({ user_id: req.session.user._id });

        if (!cart) {
            cart = new Cart({
                user_id: req.session.user._id,
                products: [{ product_id, name, image, description, quantity, price, total }],
            });
        } else {
            const existingProduct = cart.products.find(p => p.product_id === String(product_id));
            if (existingProduct) {
                existingProduct.quantity += 1;
                existingProduct.total = existingProduct.quantity * price;
            } else {
                cart.products.push({ product_id, name, image, description, quantity, price, total });
            }
        }

        await cart.save();
        res.status(200).json({ message: 'Cart updated successfully', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart', error: error.message });
    }
};


exports.getCartProducts = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user_id: req.session.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        res.json(cart.products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
    try {
        const { product_id } = req.body;  

        
        const cart = await Cart.findOne({ user_id: req.session.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

       
        const productIndex = cart.products.findIndex(p => p.product_id === String(product_id));
        if (productIndex === -1) return res.status(404).json({ message: "Product not found in cart" });

        
        cart.products.splice(productIndex, 1);

        await cart.save();
        res.status(200).json({ message: 'Product removed from cart successfully', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error removing product from cart', error: error.message });
    }
};
