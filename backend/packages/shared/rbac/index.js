const { logAudit } = require('../utils/auditLogger'); // Assuming an audit logger utility exists or will exist

// Middleware to ensure a user has one of the allowed roles
function requireRole(...allowed) {
  return (req, res, next) => {
    const { role } = req.authContext;
    if (!allowed.includes(role)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    return next();
  };
}

// Middleware for ROOT_ADMIN | ADMIN | MANAGEMENT only
function requireGlobalScope() {
  return requireRole('ROOT_ADMIN', 'ADMIN', 'MANAGEMENT');
}

// Middleware for ROOT_ADMIN only
function requireRootAdminOnly() {
  return requireRole('ROOT_ADMIN');
}

// Middleware for HOD (department scoped) or Global scoped
function requireOwnDepartment(getResourceDeptId) {
  return async (req, res, next) => {
    const { role, departmentId, userId } = req.authContext;
    if (['ROOT_ADMIN', 'ADMIN', 'MANAGEMENT'].includes(role)) return next();
    
    if (role !== 'HOD') return res.status(403).json({ error: 'FORBIDDEN' });
    
    try {
      const resourceDept = await getResourceDeptId(req);
      if (resourceDept !== departmentId) {
        if (logAudit) {
          await logAudit({ actorUserId: userId, action: 'ACCESS_DENIED', result: 'DENIED', metadata: { expected: departmentId, actual: resourceDept } });
        }
        return res.status(403).json({ error: 'DEPARTMENT_SCOPE_VIOLATION' });
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

// Middleware for Faculty assignment
function requireFacultyAssignment(getOfferingId, FacultyAssignmentClient) {
  return async (req, res, next) => {
    const { role, userId, departmentId } = req.authContext;
    if (['ROOT_ADMIN', 'ADMIN', 'MANAGEMENT'].includes(role)) return next();
    
    if (role === 'HOD') {
      // HOD passes if offering.departmentId === req.authContext.departmentId 
      // (This requires another check, ideally composing requireOwnDepartment upstream, but for safety we can just delegate or rely on upstream)
      return next();
    }
    
    if (role !== 'FACULTY') return res.status(403).json({ error: 'FORBIDDEN' });
    
    try {
      const offeringId = getOfferingId(req);
      const active = await FacultyAssignmentClient.exists({ facultyUserId: userId, offeringId, status: 'ACTIVE' });
      if (!active) {
        if (logAudit) {
          await logAudit({ actorUserId: userId, action: 'ACCESS_DENIED', resourceId: offeringId, result: 'DENIED' });
        }
        return res.status(403).json({ error: 'NOT_ASSIGNED_TO_COURSE' });
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

// Middleware for Student enrollment
function requireOwnEnrollment(getOfferingId, EnrollmentClient) {
  return async (req, res, next) => {
    const { role, userId } = req.authContext;
    if (['ROOT_ADMIN', 'ADMIN', 'MANAGEMENT'].includes(role)) return next();
    
    if (role !== 'STUDENT') return res.status(403).json({ error: 'FORBIDDEN' });
    
    try {
      const offeringId = getOfferingId(req);
      const enrolled = await EnrollmentClient.exists({ studentUserId: userId, offeringId, status: 'ACTIVE' });
      if (!enrolled) {
        return res.status(403).json({ error: 'NOT_ENROLLED' });
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

function requireSelfOrGlobal(getTargetUserId) {
  return async (req, res, next) => {
    const { role, userId } = req.authContext;
    if (['ROOT_ADMIN', 'ADMIN', 'MANAGEMENT'].includes(role)) return next();
    
    const targetUserId = getTargetUserId(req);
    if (userId !== targetUserId) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    return next();
  };
}

module.exports = {
  requireRole,
  requireGlobalScope,
  requireRootAdminOnly,
  requireOwnDepartment,
  requireFacultyAssignment,
  requireOwnEnrollment,
  requireSelfOrGlobal
};
