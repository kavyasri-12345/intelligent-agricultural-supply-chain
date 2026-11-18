const { verifyToken } = require('../config/jwt');
const dataStore = require('../models/dataStore');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. Missing authorization header.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  try {
    const decoded = verifyToken(token);
    let user = dataStore.findUserById(decoded.id);
    if (!user && decoded.email) {
      user = dataStore.findUserByEmail(decoded.email);
    }
    if (!user && decoded.id && decoded.role) {
      // Re-hydrate registered user from cryptographically verified token across container restarts
      user = {
        id: decoded.id,
        email: decoded.email || 'user@agri.org',
        fullName: decoded.fullName || 'Registered User',
        role: decoded.role
      };
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authenticateJWT;
