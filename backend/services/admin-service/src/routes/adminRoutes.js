const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// System
router.get('/health',  authMiddleware, requireAdmin, adminController.getHealth);
router.post('/backup', authMiddleware, requireAdmin, adminController.triggerBackup);
router.get('/permission-matrix', authMiddleware, requireAdmin, adminController.getPermissionMatrix);

// Audit Logs
router.get('/audit-logs', authMiddleware, requireAdmin, adminController.getAuditLogs);

// Departments
router.get('/departments',        authMiddleware, adminController.getDepartments);
router.post('/departments',       authMiddleware, requireAdmin, adminController.createDepartment);
router.patch('/departments/:id',  authMiddleware, requireAdmin, adminController.updateDepartment);
router.delete('/departments/:id', authMiddleware, requireAdmin, adminController.deactivateDepartment);

// Semesters
router.get('/semesters',              authMiddleware, adminController.getSemesters);
router.post('/semesters',             authMiddleware, requireAdmin, adminController.createSemester);
router.patch('/semesters/:id',        authMiddleware, requireAdmin, adminController.updateSemester);
router.patch('/semesters/:id/activate', authMiddleware, requireAdmin, adminController.activateSemester);

// Users (delegates to user-service / auth-service)
router.get('/users',  authMiddleware, requireAdmin, adminController.getUsers);
router.post('/users', authMiddleware, requireAdmin, adminController.createUser);
router.patch('/users/bulk', authMiddleware, requireAdmin, adminController.bulkUpdateUsers);
router.post('/users/bulk/csv', authMiddleware, requireAdmin, upload.single('file'), adminController.bulkCreateUsersCsv);

module.exports = router;