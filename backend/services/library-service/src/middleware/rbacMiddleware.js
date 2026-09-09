const jwt = require('jsonwebtoken');

function rbacMiddleware(requiredScope, allowedRoles) {
  return (req, res, next) => {
    try {
      const user = req.user; // from authMiddleware
      if (!user) return res.status(401).json({ error: 'Not authenticated' });

      // If user is ROOT_ADMIN, they can do anything
      if (user.role === 'ROOT_ADMIN') return next();

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: `Access denied. Requires one of: ${allowedRoles.join(', ')}` });
      }

      // Basic Department-level scope validation
      // If resource belongs to a department, ensure user belongs to it unless they are Management/Admin
      if (req.params.departmentId || req.query.departmentId || req.body.departmentId) {
        const targetDept = req.params.departmentId || req.query.departmentId || req.body.departmentId;
        
        if (['MANAGEMENT', 'ADMIN'].includes(user.role)) {
           // Institutional scope, pass
        } else if (user.organizationScope?.departmentId !== targetDept) {
           return res.status(403).json({ error: 'Cross-department access denied.' });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization error', details: error.message });
    }
  };
}

module.exports = rbacMiddleware;
