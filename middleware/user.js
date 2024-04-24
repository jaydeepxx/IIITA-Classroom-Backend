const jwt = require('jsonwebtoken'); // It's better to move this to an environment variable for production

const  Userauthenticate = (req, res, next) => {
    // Retrieve the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    const token = authHeader;

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the email from the token to the request object
        req.email = decoded.email;
        req.role = decoded.role;
        req.name = decoded.name;
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error("Authentication error:", err);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = Userauthenticate;