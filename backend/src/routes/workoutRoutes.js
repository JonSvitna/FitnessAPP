const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.post('/generate', workoutController.generateWorkout);
router.get('/history', workoutController.getWorkoutHistory);
router.get('/today', workoutController.getTodaysWorkouts);
router.get('/:id', workoutController.getWorkout);
router.get('/:id/pdf', workoutController.generatePDF);
router.put('/:id', workoutController.updateWorkout);

module.exports = router;
