const connectDB = require('./mongoose');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const mongoConnect = require('connect-mongo');

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));

app.use(bodyParser.json());
connectDB();

app.use(session({
    secret: "theproduct",
    resave: false,
    saveUninitialized: false,
    store: mongoConnect.create({
        mongoUrl: 'mongodb://localhost:27017/shopping',
        collectionName: 'sessions',
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: 'lax',  // Adjust this if using HTTPS or cross-origin requests
    },
}));

function authenticate(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

const user_schema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const cart_schema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            product_id: { type: String, required: true },
            name: { type: String, required: true },
            image: { type: String, required: true },
            description: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            total: { type: Number, required: true },
        },
    ],
});

const User = mongoose.model('User', user_schema);
const Cart = mongoose.model('Cart', cart_schema);

// User register
app.post('/user_register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ name: username, email, password });
        await newUser.save();
        res.status(200).json({ message: "User successfully registered" });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// User login
app.post('/user_login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not registered" });
        if (password !== user.password) return res.status(401).json({ message: "Password is incorrect" });

        req.session.user = { _id: user._id };  // Store user ID in session
        console.log('User logged in:', req.session); // Debug session

        res.status(200).json({ message: "Successfully logged in" });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Add to cart
app.post('/add_to_cart', authenticate, async (req, res) => {
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
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: 'Error updating cart', error: error.message });
    }
});

// Remove from cart
app.post('/remove_from_cart', authenticate, async (req, res) => {
    const { product_id, name, image, description, quantity, price, total } = req.body;
    try {
        let cart = await Cart.findOne({ user_id: req.session.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const existingProduct = cart.products.find(p => p.product_id === product_id);

        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        if (existingProduct.quantity > 1) {
            existingProduct.quantity -= 1;
            existingProduct.total = existingProduct.quantity * price;
        } else {
            cart.products = cart.products.filter(p => p.product_id !== product_id);
        }

        if (cart.products.length === 0) {
            await Cart.deleteOne({ user_id: req.session.user._id });
            return res.status(200).json({ message: 'Cart is now empty' });
        }

        await cart.save();
        res.status(200).json({ message: 'Product removed from cart successfully', cart });
    } catch (error) {
        console.error("Error removing product from cart:", error);
        res.status(500).json({ message: 'Error removing product from cart', error: error.message });
    }
});

// Fetch cart products
app.get('/get_products', authenticate, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user_id: req.session.user._id });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        res.json(cart.products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Logout
app.get('/logout', (req, res) => {
    if (!req.session.user) {
        return res.status(400).json({ message: "No user logged in" });
    }

    Cart.deleteOne({ user_id: req.session.user._id }) // Clear cart on logout
        .then(() => {
            req.session.destroy(err => {
                if (err) return res.status(500).json({ message: "Logout failed" });
                res.clearCookie('connect.sid');
                res.status(200).json({ message: "Logout successful" });
            });
        })
        .catch(error => {
            console.error("Error clearing cart during logout:", error);
            res.status(500).json({ message: "Error clearing cart during logout", error: error.message });
        });
});

// Server port
app.listen(1234, () => {
    console.log("Server is running on port 1234");
});
