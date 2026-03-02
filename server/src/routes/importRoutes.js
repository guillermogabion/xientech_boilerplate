const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');
const authenticateToken = require('../middleware/authMiddleware');


// This is the Route
router.post('/', authenticateToken, importController.importResidents);

module.exports = router;