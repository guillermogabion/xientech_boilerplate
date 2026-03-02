const express = require('express');
const router = express.Router();
// 1. Import the entire object as 'userController'
const streetController = require('../controllers/streetController');

router.get('/', streetController.getStreet); 
router.get('/:id', streetController.getStreetById);     
router.post('/', streetController.createStreet);        // Create/Sign up user
router.put('/:id', streetController.updateStreet);      // Update user
router.delete('/:id', streetController.deleteStreet);   // Delete user

module.exports = router;