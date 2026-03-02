const express = require('express');
const router = express.Router();
const skController = require('../controllers/skController');

// --- DASHBOARD & ANALYTICS ---
router.get('/stats', skController.getSKStats);

// --- LEGISLATIVE ---
router.get('/resolutions', skController.getResolutions);
router.get('/resolutions/:id', skController.getResolutionById);
router.post('/resolutions', skController.createResolution);

// --- PROGRAMS MANAGEMENT (Displayed on Resident Portal) ---
// Note: Resident-facing route
router.get('/programs/active', skController.getActivePrograms); 

// Note: Admin-facing CRUD
router.get('/programs', skController.getAllSKPrograms);
router.post('/programs', skController.createSKProgram);
router.put('/programs/:id/status', skController.updateProgramStatus);
router.delete('/programs/:id', skController.deleteProgram);

// --- SERVICES & APPLICATIONS ---

// 1. Counts must come BEFORE routes with :id
router.get('/services/counts', skController.getServiceRequestCounts); 

// 2. Resident Application
router.post('/services/apply', skController.applyForService);

// 3. Official Management
router.get('/services/requests', skController.getServiceRequests);
router.get('/services/requests/:id', skController.getServiceRequestById);
router.put('/services/verify/:id', skController.updateApplicationStatus);

// --- FINANCE & VOUCHERS (SK Treasurer Side) ---
router.get('/payees/search', skController.searchPayee);
router.post('/vouchers', skController.createVoucher);
router.get('/budget/summary', skController.getBudgetSummary);
router.get('/reports/disbursements', skController.getMonthlyDisbursementReport);

module.exports = router;