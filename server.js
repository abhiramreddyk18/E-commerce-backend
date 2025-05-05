const express = require('express');
const session = require('express-session');
const mongoConnect = require('connect-mongo');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { authenticate } = require('./middleware/authMiddleware');

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

connectDB();
app.use(express.json());

app.use(cors({
    origin: ["http://localhost:4200", "https://abhiramreddyk18.github.io/E-commerce-frontend"],
    credentials: true,
}));

console.log( "url---->"+process.env.FRONTEND_URL);

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoConnect.create({ mongoUrl: process.env.MONGO_URI, collectionName: 'sessions' }),
    cookie: { maxAge: 86400000, httpOnly: true, secure: true, sameSite: 'None' },
}));


app.get('/auth/session', (req, res) => {
    if (req.session.user) {
        const now = Date.now();
        const sessionExpiry = req.session.cookie._expires;
        
        if (sessionExpiry && now > new Date(sessionExpiry).getTime()) {
            req.session.destroy();  
            return res.status(401).json({ loggedIn: false, message: "Session expired" });
        }
        
        return res.json({ loggedIn: true, user: req.session.user });
    }
    
    res.status(401).json({ loggedIn: false });
});

app.use('/user', userRoutes);
app.use('/cart', authenticate, cartRoutes);

app.get('/getsessiondata',(req, res)=>{
    try{
        return res.status(200).json({session: req.session});
    }
    catch(err){
        return res.status(404).json({sessionError: req.session})

    }
})


const PORT = process.env.PORT || 1234;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
