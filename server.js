const express = require('express');
const session = require('express-session');
const mongoConnect = require('connect-mongo');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

connectDB();
app.use(express.json());

app.use(cors({
    origin: ["http://localhost:4200", process.env.FRONTEND_URL],
    credentials: true,
}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: mongoConnect.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 86400000, httpOnly: true, sameSite: 'lax' },
}));

app.use('/user', userRoutes);
app.use('/cart', cartRoutes);

app.get('/auth/session', (req, res) => {
    if (req.session.user) {
        const now = Date.now();
        const sessionExpiry = req.session.cookie.expires;

        if (sessionExpiry && now > new Date(sessionExpiry).getTime()) {
            req.session.destroy();  
            return res.status(401).json({ loggedIn: false, message: "Session expired" });
        }

        return res.json({ loggedIn: true, user: req.session.user });
    }

    res.status(401).json({ loggedIn: false });
});



const PORT = process.env.PORT || 1234;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
