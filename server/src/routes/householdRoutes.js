const express = require('express');
const router = express.Router();
const householdController = require('../controllers/householdController');

// 1. Static & Special Utility Routes
router.get('/all', householdController.getAllHousehold); 
router.get('/next-number', householdController.getNextId);     
router.get('/autocomplete', householdController.getAllHouseholdsAutoComplete);     

// New: Search specifically for violators within a Purok (Head, Member, HH#, or ID)
router.get('/search-violations/:purokId', householdController.searchHouseholdsForViolations);
router.get('/number/:household_no', householdController.getHouseholdByNo);
// Get all households in a specific Purok (Initial load)
router.get('/purok/:purokId', householdController.getByPurok);

// 2. Resource Root
router.get('/', householdController.getHousehold); 
router.post('/', householdController.createHousehold);

// 3. Dynamic routes (Parameters) - KEEP THESE AT THE BOTTOM
router.get('/:id', householdController.getHouseholdById);     
router.put('/:id', householdController.updateHousehold);      
router.delete('/:id', householdController.deleteHousehold);

module.exports = router;