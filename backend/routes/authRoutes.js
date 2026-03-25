// ============================================================
// Express.js Advanced Concept: API Rate Limiting Security
// ============================================================
// Protects login/register routes from brute-force attacks and
// DDoS bots by limiting requests per IP address within a time
// window. Exceeding the limit returns 429 Too Many Requests.
// ============================================================

const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ---- Rate Limiting Middleware ----
const rateLimit = require('express-rate-limit');

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15-minute window
    max: 10,                    // Max 10 requests per window per IP
    message: {
        message: 'Too many attempts from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true,      // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false         // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to auth endpoints
router.post('/login', authRateLimiter, login);
router.post('/register', authRateLimiter, register);
router.get('/me', protect, getMe);

module.exports = router;
