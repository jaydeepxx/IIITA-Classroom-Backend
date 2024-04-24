const jwt = require('jsonwebtoken');

const userAuthenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader;
        
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;  // Attach user to request
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = userAuthenticate;