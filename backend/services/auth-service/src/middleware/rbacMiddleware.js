const User = require('../models/User');
const Role = require('../models/Role');
// Note: We assume the request has already passed through `authMiddleware` and `req.user` is set.

/**
 * Middleware to authorize an action based on Role permissions and Scope constraints.
 * 
 * @param {string} requiredPermission - e.g., 'COURSE_UPDATE'
 * @param {Function} scopeValidator - Optional function to validate cross-department or resource ownership constraints.
 *   Signature: (req, user) => boolean | Promise<boolean>
 */
const authorize = (requiredPermission, scopeValidator = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Unauthorized: No valid user context.' });
      }

      // Load current user from database to ensure real-time status and role
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: User not found in database.' });
      }

      if (user.status !== 'ACTIVE' && user.status !== 'active') {
        return res.status(403).json({ error: 'Forbidden: Account is inactive or suspended.' });
      }

      // Resolve Role & Permissions
      const roleDoc = await Role.findOne({ name: user.role });
      if (!roleDoc) {
        return res.status(403).json({ error: 'Forbidden: Role definition not found.' });
      }

      const permissions = roleDoc.permissions || [];
      const isRootAdmin = user.role === 'ROOT_ADMIN';

      // Verify Permission (Root Admin automatically bypasses permission check)
      if (!isRootAdmin && requiredPermission && !permissions.includes(requiredPermission)) {
        return res.status(403).json({ error: `Forbidden: Missing required permission '${requiredPermission}'` });
      }

      // Execute dynamic scope validation (ABAC)
      if (!isRootAdmin && scopeValidator) {
        const isScopeValid = await scopeValidator(req, user);
        if (!isScopeValid) {
          return res.status(403).json({ error: 'Forbidden: You do not have academic or organizational scope for this resource.' });
        }
      }

      // Inject full user object into request for controllers to use
      req.currentUser = user;
      next();
    } catch (error) {
      console.error('Authorization Error:', error);
      res.status(500).json({ error: 'Internal Server Error during authorization.' });
    }
  };
};

module.exports = { authorize };
