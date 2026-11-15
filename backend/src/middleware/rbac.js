/**
 * Role-Based Access Control Middleware
 * Supported Roles: ADMIN, PLANNER, FARMER, RETAILER, STORAGE_MANAGER, TRANSPORT_MANAGER
 */
const permit = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated request.' });
    }

    if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      error: `Forbidden. Role '${req.user.role}' lacks permission for this resource. Required: [${allowedRoles.join(', ')}]`
    });
  };
};

module.exports = permit;
