const express = require('express');
const router = express.Router();
const goalsController = require('../controllers/goalsController');
const { authMiddleware } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(authMiddleware);

router.get('/', apiLimiter, goalsController.getGoals);
router.post('/', apiLimiter, goalsController.createGoal);
router.put('/:id', apiLimiter, goalsController.updateGoal);
router.delete('/:id', apiLimiter, goalsController.deleteGoal);

module.exports = router;
