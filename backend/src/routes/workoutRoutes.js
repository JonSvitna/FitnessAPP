const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { authMiddleware } = require('../middleware/auth');
const { workoutLimiter, apiLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(authMiddleware);

router.post('/generate', workoutLimiter, workoutController.generateWorkout);
router.get('/history', apiLimiter, workoutController.getWorkoutHistory);
router.get('/today', apiLimiter, workoutController.getTodaysWorkouts);
router.get('/:id', apiLimiter, workoutController.getWorkout);
router.get('/:id/pdf', apiLimiter, workoutController.generatePDF);
router.put('/:id', apiLimiter, workoutController.updateWorkout);

module.exports = router;
