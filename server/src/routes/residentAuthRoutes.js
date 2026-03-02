const express = require('express');
const router = express.Router();
const residentAuthController = require('../controllers/residentAuthController')
const { loginLimiter } = require('../middleware/rateLimiter');



router.post('/resident-login', loginLimiter,  residentAuthController.residentLogin);
router.post('/activate', residentAuthController.activateResident);
module.exports = router;