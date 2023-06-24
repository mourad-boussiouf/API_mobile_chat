const isAuth = (req, res, next) => {

    const authToken = req.cookies.token;
    // Inject the user to the request
    req.user = authToken

    if (req.user) {
        next();
    } else {
        res.json({
            message: 'Please login to continue',
            messageClass: 'alert-danger'
        });
    }
};

module.exports = isAuth 