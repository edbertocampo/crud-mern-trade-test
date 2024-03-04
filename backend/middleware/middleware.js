// middleware.js
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, '454154609908bc21e9e54d3f3b990fce719734ef1cf1a895d07aa1c2c3c14cd8', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        req.user = user;
        next();
    });
};

module.exports = {
    authenticateToken,
};
