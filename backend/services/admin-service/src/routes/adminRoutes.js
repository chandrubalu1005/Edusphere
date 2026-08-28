const express        = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware  = require('../middleware/authMiddleware');
const router         = express.Router();
const multer         = require('multer');
const upload         = multer({ storage: multer.memoryStorage() });

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
}

// ── System Health ──────────────────────────────────────────────────────────
router.get('/health',      authMiddleware, requireAdmin, adminController.getHealth);
router.get('/health/all',  authMiddleware, requireAdmin, adminController.getHealthAll);
// Backup
router.get('/backups',     authMiddleware, requireAdmin, adminController.getBackupRecords);
router.post('/backup',     authMiddleware, requireSuperAdmin, adminController.triggerBackup);

// ── Audit Logs ─────────────────────────────────────────────────────────────
router.get('/audit-logs', authMiddleware, requireAdmin, adminController.getAuditLogs);

// ── Permission Matrix ──────────────────────────────────────────────────────
router.get('/permission-matrix', authMiddleware, requireAdmin, adminController.getPermissionMatrix);

// ── Departments ────────────────────────────────────────────────────────────
router.get('/departments',        authMiddleware, adminController.getDepartments);
router.post('/departments',       authMiddleware, requireAdmin, adminController.createDepartment);
router.patch('/departments/:id',  authMiddleware, requireAdmin, adminController.updateDepartment);
router.delete('/departments/:id', authMiddleware, requireAdmin, adminController.deactivateDepartment);

// ── Semesters ──────────────────────────────────────────────────────────────
router.get('/semesters',                  authMiddleware, adminController.getSemesters);
router.post('/semesters',                 authMiddleware, requireAdmin, adminController.createSemester);
router.patch('/semesters/:id',            authMiddleware, requireAdmin, adminController.updateSemester);
router.patch('/semesters/:id/activate',   authMiddleware, requireAdmin, adminController.activateSemester);
router.post('/semesters/:id/close',       authMiddleware, requireAdmin, adminController.closeSemester);

function requireUserManagement(req, res, next) {
  const allowedRoles = ['faculty', 'admin', 'management', 'super_admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'User management access required' });
  }
  next();
}

// ── Users ──────────────────────────────────────────────────────────────────
router.get('/users',             authMiddleware, requireUserManagement, adminController.getUsers);
router.post('/users',            authMiddleware, requireUserManagement, adminController.createUser);
router.patch('/users/bulk',      authMiddleware, requireUserManagement, adminController.bulkUpdateUsers);
router.post('/users/bulk/csv',   authMiddleware, requireUserManagement, upload.single('file'), adminController.bulkCreateUsersCsv);
router.post('/users/:id/password-reset', authMiddleware, requireUserManagement, adminController.resetUserPassword);

// ── Help Desk / Support Tickets ────────────────────────────────────────────
// Students create their own; admins read all + respond
router.get('/helpdesk/tickets',       authMiddleware, adminController.getTickets);
router.post('/helpdesk/tickets',      authMiddleware, adminController.createTicket);
router.patch('/helpdesk/tickets/:id', authMiddleware, requireAdmin, adminController.respondToTicket);

module.exports = router;