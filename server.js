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
    saveUninitialized: false,
    store: mongoConnect.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 86400000, httpOnly: true, sameSite: 'lax' },
}));

app.use('/user', userRoutes);
app.use('/cart', cartRoutes);

const PORT = process.env.PORT || 1234;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
