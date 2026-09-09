const express = require('express');
const libraryController = require('../controllers/libraryController');
const circulationController = require('../controllers/circulationController');
const reservationController = require('../controllers/reservationController');
const fineController = require('../controllers/fineController');
const catalogController = require('../controllers/catalogController');
const digitalResourceController = require('../controllers/digitalResourceController');
const courseResourceController = require('../controllers/courseResourceController');
const inventoryController = require('../controllers/inventoryController');
const acquisitionController = require('../controllers/acquisitionController');
const clearanceController = require('../controllers/clearanceController');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/books',              authMiddleware, libraryController.getBooks);
router.post('/books',             authMiddleware, libraryController.createBook);
router.get('/books/:id/stream',   authMiddleware, libraryController.streamBook);
router.get('/issues/:userId',     authMiddleware, libraryController.getIssues);
router.post('/issues',            authMiddleware, libraryController.issueBook);
router.patch('/issues/:id/return',authMiddleware, libraryController.returnBook);

// Core Circulation API
router.get('/circulation/loans', authMiddleware, circulationController.getLoans);
router.post('/circulation/issue', authMiddleware, circulationController.issueBook);
router.patch('/circulation/loans/:id/return', authMiddleware, circulationController.returnBook);
router.patch('/circulation/loans/:id/renew', authMiddleware, circulationController.renewLoan);

// Reservations API
router.get('/reservations', authMiddleware, reservationController.getReservations);
router.post('/reservations', authMiddleware, reservationController.createReservation);
router.patch('/reservations/:id/cancel', authMiddleware, reservationController.cancelReservation);

// Fines API
router.get('/fines', authMiddleware, fineController.getFines);
router.post('/fines/:id/pay', authMiddleware, fineController.payFine);
router.post('/fines/:id/waive', authMiddleware, fineController.waiveFine);

// Catalog API (Search)
router.get('/catalog/search', authMiddleware, catalogController.searchCatalog);
router.post('/catalog', authMiddleware, catalogController.createTitle);

// Digital Resources API
router.get('/digital-resources', authMiddleware, digitalResourceController.getDigitalResources);
router.post('/digital-resources/:id/access', authMiddleware, digitalResourceController.accessResource);

// Course Resources API (Unit 1-5 scoped)
router.get('/course-resources', authMiddleware, courseResourceController.getCourseResources);
router.post('/course-resources', authMiddleware, courseResourceController.uploadCourseResource);


// Inventory API
router.post('/inventory/sessions', authMiddleware, inventoryController.startSession);
router.post('/inventory/sessions/:sessionId/scan', authMiddleware, inventoryController.scanCopy);
router.patch('/inventory/sessions/:sessionId/end', authMiddleware, inventoryController.endSession);

// Acquisition API
router.post('/acquisitions/requests', authMiddleware, acquisitionController.requestAcquisition);
router.patch('/acquisitions/requests/:id/review', authMiddleware, acquisitionController.approveAcquisition);
router.post('/acquisitions/purchase-orders', authMiddleware, acquisitionController.createPurchaseOrder);
router.post('/acquisitions/purchase-orders/:id/receive', authMiddleware, acquisitionController.receiveOrder);

// Clearance API
router.get('/clearance/:userId', authMiddleware, clearanceController.getClearanceStatus);

// Analytics API
router.get('/analytics/kpi', authMiddleware, analyticsController.getLibraryKPIs);

module.exports = router;