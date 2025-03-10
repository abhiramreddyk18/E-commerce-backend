const User = require('../models/User');

exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ name: username, email, password });
        await newUser.save();
        res.status(200).json({ message: "User successfully registered" });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
            
        if (!user) return res.status(404).json({ message: "User not registered" });
        if (password !== user.password) return res.status(401).json({ message: "Password is incorrect" });

        req.session.user = { _id: user._id.toString() };  
        req.session.save(err => console.log('save error', err, 'save error'));
        console.log("after user stored in session",req.session);
        res.status(200).json({ message: "Successfully logged in" });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

exports.logoutUser = (req, res) => {
    if (!req.session.user) {
        return res.status(400).json({ message: "No user logged in" });
    }

    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Logout successful" });
    });
};
