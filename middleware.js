const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get the token from the request header
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, 'secretkey');
        console.log("the decoded info is ", decoded) ;
        // Attach the user details to the request object
        req.user = decoded;
        
        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid'});
    }
};

module.exports = authMiddleware;
