const jwt = require('jsonwebtoken');

function generateToken(user) {
    return jwt.sign({ id: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET, { expiresIn: '7d' }
    );
}

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalide' });
    }
}

// Middleware pour restreindre par rôle
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Accès refusé : rôle insuffisant' });
        }
        next();
    };
}

module.exports = { generateToken, verifyToken, requireRole };