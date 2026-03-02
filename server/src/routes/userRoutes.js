const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
// Import your rate limiter middleware
const { loginLimiter } = require('../middleware/rateLimiter');




router.get('/isAdminExist', userController.checkAdminExists);
router.get('/', authenticateToken, userController.getUsers);
router.post('/', authenticateToken, userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/all', userController.getAllUsers);
router.get('/me', authenticateToken, userController.getMe);
// --- AUTH ROUTES ---

// Apply the limiter here. 
// The order is: Request -> Limiter -> Controller
router.post('/login', loginLimiter, userController.login);

// Forgot Password - User requests a link via email
// Using loginLimiter here protects your SMTP server from spam
router.post('/forgot-password', loginLimiter, userController.forgotPassword);

// Reset Password - User submits new password with the token from email
router.post('/reset-password/:token', userController.resetPassword);

router.post('/logout', userController.logout);
router.post('/send-request', userController.createRequest);

module.exports = router;