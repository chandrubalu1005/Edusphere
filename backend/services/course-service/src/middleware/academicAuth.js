const jwt = require('jsonwebtoken');

// A basic mapping of roles to permissions for the Academic Core
const ROLE_PERMISSIONS = {
  student: [
    'academic.programme.view',
    'academic.curriculum.view',
    'academic.course.view',
    'academic.offering.view',
    'academic.registration.view',
    'academic.registration.create',
    'academic.minor.view',
    'academic.minor.apply',
    'academic.honours.view',
    'academic.honours.apply',
    'academic.degreeAudit.view'
  ],
  faculty: [
    'academic.programme.view',
    'academic.curriculum.view',
    'academic.course.view',
    'academic.offering.view',
    'academic.section.view',
    'academic.student.view'
  ],
  management: [
    'academic.programme.view',
    'academic.curriculum.view',
    'academic.course.view',
    'academic.offering.view',
    'academic.analytics.view'
  ],
  admin: [
    'academic.programme.view',
    'academic.programme.create',
    'academic.programme.edit',
    'academic.programme.publish',
    'academic.curriculum.view',
    'academic.curriculum.create',
    'academic.curriculum.edit',
    'academic.curriculum.approve',
    'academic.curriculum.publish',
    'academic.course.view',
    'academic.course.create',
    'academic.course.edit',
    'academic.offering.view',
    'academic.offering.create',
    'academic.offering.edit',
    'academic.offering.publish',
    'academic.section.view',
    'academic.section.create',
    'academic.section.edit',
    'academic.section.assignFaculty',
    'academic.minor.view',
    'academic.minor.create',
    'academic.minor.edit',
    'academic.minor.publish',
    'academic.honours.view',
    'academic.honours.create',
    'academic.honours.edit',
    'academic.honours.publish',
    'academic.degreeAudit.view',
    'academic.degreeAudit.run',
    'academic.degreeAudit.override',
    'academic.graduation.view',
    'academic.graduation.approve',
    'academic.registration.view',
    'academic.registration.approve',
    'academic.registration.override',
    'academic.credit.view',
    'academic.credit.transfer',
    'academic.credit.approve'
  ]
};

// Middleware to enforce permissions
const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = decoded; // Contains id, role, etc.

      const userRole = req.user.role;
      const userPermissions = ROLE_PERMISSIONS[userRole] || [];

      if (userRole === 'admin') {
        // Admin gets all by default in this mapping
        return next();
      }

      if (userPermissions.includes(requiredPermission)) {
        // We could also do scope checking here based on context
        // e.g. if requiredPermission is 'academic.registration.create', ensure req.body.studentId === req.user.id
        if (requiredPermission.includes('registration') && req.body.studentId && req.body.studentId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: Scope violation' });
        }
        return next();
      }

      return res.status(403).json({ error: `Forbidden: Requires permission ${requiredPermission}` });
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };
};

module.exports = {
  requirePermission,
  ROLE_PERMISSIONS
};
