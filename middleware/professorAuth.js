const jwt = require('jsonwebtoken');

const professorauthenticate = (req, res, next) => {
    // Assuming the JWT token is sent in the authorization header
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ msg: "Access denied. No token provided." });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user's role is 'professor'
        if (decoded.role !== 'Professor') {
            return res.status(403).json({ msg: "Access denied. User is not a professor." });
        }

        // If the role is correct, pass control to the next middleware
        req.user = decoded; // optional: pass the decoded user information to the request object
        next();
    } catch (error) {
        console.error(error);
        res.status(400).json({ msg: "Invalid token" });
    }
};

module.exports = professorauthenticate;
