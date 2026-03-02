const rateLimit = require('express-rate-limit');

// Define the limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 attempts
    message: {
        message: "Too many login attempts from this IP, please try again after 15 minutes"
    },
    skipSuccessfulRequests: true, 
    standardHeaders: true, 
    legacyHeaders: false, 
});

// Use module.exports instead of 'export const'
module.exports = { loginLimiter };