const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/peaceOrderController');

// --- Incident / Blotter Management ---


router.get('/analytics/stats', incidentController.getBlotterAnalytics)
// Get all incidents (with search and pagination)
router.get('/', incidentController.getIncident);

// get all no filter 
router.get('/all', incidentController.getAllIncident);

router.get('/blotter', incidentController.getNotPending);
// Create a new incident/blotter
router.post('/', incidentController.createIncident);

// Get specific incident details (including hearings)
router.get('/:id', incidentController.getIncidentById);

// Update incident details or status
router.put('/:id', incidentController.updateIncident);

// Delete an incident
router.delete('/:id', incidentController.deleteIncident);

// --- Hearing Management ---

// Schedule a new hearing for a specific blotter
router.post('/hearings', incidentController.createHearing);

// Update a specific hearing (minutes, date, or status)
router.put('/hearings/:id', incidentController.updateHearing);

// Delete/Cancel a hearing
router.delete('/hearings/:id', incidentController.deleteHearing);

module.exports = router;