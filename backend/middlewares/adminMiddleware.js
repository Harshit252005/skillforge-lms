const jwt = require("jsonwebtoken");
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || "fallback_admin_secret_key_123";

function adminMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_ADMIN_SECRET);
        req.adminId = decoded.id; // Store the admin's database ID in the request object
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}

module.exports = { adminMiddleware };