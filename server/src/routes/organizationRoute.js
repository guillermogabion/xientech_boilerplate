const express = require('express');
const router = express.Router();
const orgController = require('../controllers/organizationController');
const { protect } = require('../middleware/authMiddleware');
const authenticateToken = require('../middleware/authMiddleware');
// Custom middleware to check if user is Super Admin
const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'SUPER_ADMIN') {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Super Admin access required" });
    }
};
router.post('/', authenticateToken, isSuperAdmin, orgController.createOrganization);
router.get('/', authenticateToken, isSuperAdmin, orgController.getOrganizations);

module.exports = router;