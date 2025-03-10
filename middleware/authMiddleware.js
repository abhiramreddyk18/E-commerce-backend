exports.authenticate = (req, res, next) => {
    console.log(req.session);
    console.log("I am in authenticaete middleware");
    if (req.session.user) {
        console.log('user authenticated');
        next();
    } else {
        res.status(401).json({status: 'Unauthorized 2222'});
    }
};
