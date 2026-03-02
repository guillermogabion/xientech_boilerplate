const express = require('express');
const router = express.Router();
// 1. Import the entire object as 'userController'
const purokController = require('../controllers/PurokController');

router.get('/', purokController.getPurok); 
router.get('/all', purokController.getAllPurok);
router.get('/:id', purokController.getPurokById);     
router.post('/', purokController.createPurok);        // Create/Sign up user
router.put('/:id', purokController.updatePurok);      // Update user
router.delete('/:id', purokController.deletePurok);   // Delete user

module.exports = router;