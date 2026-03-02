const express = require('express');
const router = express.Router();
const wasteController = require('../controllers/wasteController');

// --- Waste Schedules ---
// For setting up and viewing the "verbal rules" (MWF, TTH, etc.)
router.post('/schedules', wasteController.createSchedule);
router.get('/purok/:purokId/schedules', wasteController.getSchedulesByPurok);


router.patch('/schedules/:id', wasteController.updateSchedule); // Update a specific schedule
router.delete('/schedules/:id', wasteController.deleteSchedule); // Remove a specific schedule
// --- Waste Collection Logs ---
// For the main daily logs of the garbage truck/trike per Purok
router.post('/logs', wasteController.createCollectionLog);
router.get('/logs', wasteController.getCollectionLogs);

// --- Waste Violations ---
// For tracking unsegregated waste at the Household level
router.post('/violations', wasteController.createViolation);
router.get('/violations', wasteController.getViolations);
router.patch('/violations/:id/status', wasteController.updateViolationStatus);

module.exports = router;