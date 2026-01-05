const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');

// Public routes with stricter rate limiting
router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);

// Protected routes with general API rate limiting
router.get('/profile', authMiddleware, apiLimiter, authController.getProfile);
router.put('/profile', authMiddleware, apiLimiter, authController.updateProfile);

module.exports = router;
