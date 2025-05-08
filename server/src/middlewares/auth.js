const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET ; 

const authenticateCustomer = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authorization token missing or invalid!' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next(); // Go to next middleware or controller
    } catch (error) {
        console.error('JWT Auth Error:', error);
        return res.status(401).json({ success: false, message: 'Authentication failed!' });
    }
};

module.exports = authenticateCustomer;