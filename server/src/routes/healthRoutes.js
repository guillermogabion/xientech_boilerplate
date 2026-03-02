const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

/**
 * SECTION 1: HEALTH PROFILING (The "Clinical Identity")
 */

// Get all profiles with smart search (resident:, purok:, condition:, status:)
router.get('/profiles', healthController.getHealthProfiles);

// Get a specific resident's profile (calculates BMI automatically)
router.get('/profile/:id', healthController.getHealthProfileByResidentId);

// Create a new medical profile for a resident
router.post('/profile', healthController.createHealthProfile);

// Update vitals or medical conditions
router.put('/profile/:id', healthController.updateHealthProfile);

// Delete a medical profile
router.delete('/profile/:id', healthController.deleteHealthProfile);


/**
 * SECTION 2: CLINIC VISITS (The "Encounters")
 */

// Record a new visit (Checkup, Prenatal, Immunization, etc.)
router.post('/visit', healthController.createVisit);

// Get the full medical timeline/history of a specific resident
router.get('/history/:residentId', healthController.getResidentVisitHistory);

// Mark a visit as invalid/valid (Instead of hard deleting)
router.patch('/visit/:id/status', healthController.updateVisitStatus);


module.exports = router;