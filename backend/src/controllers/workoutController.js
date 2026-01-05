const OpenAI = require('openai');
const pool = require('../config/database');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate workout plan
exports.generateWorkout = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      activity_style,
      equipment_available,
      workout_location,
      days_per_week,
      workout_days,
      user_info
    } = req.body;

    // Validate input
    if (!activity_style || !workout_location || !days_per_week) {
      return res.status(400).json({ 
        error: 'Activity style, workout location, and days per week are required' 
      });
    }

    // Get user profile for personalization
    const userProfile = await client.query(
      `SELECT u.name, p.age, p.weight, p.height, p.fitness_level, p.goals
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    const profile = userProfile.rows[0] || {};

    // Build the prompt for OpenAI
    const prompt = `Create a detailed ${days_per_week}-day per week workout plan with the following specifications:

User Information:
- Name: ${profile.name || 'User'}
- Age: ${profile.age || 'Not specified'}
- Weight: ${profile.weight || 'Not specified'}
- Height: ${profile.height || 'Not specified'}
- Fitness Level: ${profile.fitness_level || user_info?.fitness_level || 'Intermediate'}
- Goals: ${profile.goals || user_info?.goals || 'General fitness'}

Workout Preferences:
- Activity Style: ${activity_style}
- Equipment Available: ${equipment_available?.join(', ') || 'None specified'}
- Location: ${workout_location}
- Days per Week: ${days_per_week}
- Preferred Days: ${workout_days?.join(', ') || 'Flexible'}

Please provide:
1. A weekly overview
2. Detailed daily workout plans for each day
3. Exercise descriptions with sets, reps, and rest periods
4. Warm-up and cool-down routines
5. Progressive overload suggestions
6. Safety tips and modifications

Format the response as a structured workout plan that can be easily followed.`;

    console.log('Calling OpenAI API...');
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional fitness trainer and workout plan designer. Create detailed, safe, and effective workout plans tailored to individual needs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const workoutPlan = completion.choices[0].message.content;

    // Save to database
    const result = await client.query(
      `INSERT INTO workout_generations 
       (user_id, activity_style, equipment_available, workout_location, 
        days_per_week, workout_days, workout_plan)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [
        req.user.id,
        activity_style,
        equipment_available || [],
        workout_location,
        days_per_week,
        workout_days || [],
        workoutPlan
      ]
    );

    const generationId = result.rows[0].id;

    // Parse workout plan and create individual workout entries
    // (This is a simplified version; you might want more sophisticated parsing)
    if (workout_days && workout_days.length > 0) {
      for (const day of workout_days) {
        await client.query(
          `INSERT INTO workouts (user_id, generation_id, day_of_week, exercises)
           VALUES ($1, $2, $3, $4)`,
          [req.user.id, generationId, day, JSON.stringify({ raw: workoutPlan })]
        );
      }
    }

    res.json({
      message: 'Workout plan generated successfully',
      generation_id: generationId,
      workout_plan: workoutPlan
    });
  } catch (error) {
    console.error('Generate workout error:', error);
    res.status(500).json({ 
      error: 'Failed to generate workout plan',
      details: error.message 
    });
  } finally {
    client.release();
  }
};

// Get workout history
exports.getWorkoutHistory = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT id, activity_style, workout_location, days_per_week, 
              workout_days, created_at
       FROM workout_generations
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.user.id]
    );

    res.json({ workouts: result.rows });
  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({ error: 'Failed to get workout history' });
  } finally {
    client.release();
  }
};

// Get specific workout
exports.getWorkout = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    const result = await client.query(
      `SELECT * FROM workout_generations
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json({ workout: result.rows[0] });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ error: 'Failed to get workout' });
  } finally {
    client.release();
  }
};

// Generate PDF
exports.generatePDF = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    const result = await client.query(
      `SELECT wg.*, u.name as user_name
       FROM workout_generations wg
       JOIN users u ON wg.user_id = u.id
       WHERE wg.id = $1 AND wg.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const workout = result.rows[0];

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=workout-plan-${id}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content
    doc.fontSize(24).text('Your Personalized Workout Plan', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Generated for: ${workout.user_name}`);
    doc.text(`Date: ${new Date(workout.created_at).toLocaleDateString()}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Workout Details:', { underline: true });
    doc.fontSize(12);
    doc.text(`Activity Style: ${workout.activity_style}`);
    doc.text(`Location: ${workout.workout_location}`);
    doc.text(`Days per Week: ${workout.days_per_week}`);
    doc.text(`Workout Days: ${workout.workout_days.join(', ')}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Workout Plan:', { underline: true });
    doc.fontSize(10);
    doc.text(workout.workout_plan, {
      align: 'left',
      lineGap: 2
    });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  } finally {
    client.release();
  }
};

// Get today's workouts
exports.getTodaysWorkouts = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    const result = await client.query(
      `SELECT w.*, wg.activity_style, wg.workout_plan
       FROM workouts w
       JOIN workout_generations wg ON w.generation_id = wg.id
       WHERE w.user_id = $1 AND w.day_of_week = $2
       ORDER BY w.created_at DESC
       LIMIT 1`,
      [req.user.id, today]
    );

    res.json({ 
      workouts: result.rows,
      today: today
    });
  } catch (error) {
    console.error('Get today\'s workouts error:', error);
    res.status(500).json({ error: 'Failed to get today\'s workouts' });
  } finally {
    client.release();
  }
};

// Update workout
exports.updateWorkout = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { completed, notes } = req.body;

    const result = await client.query(
      `UPDATE workouts
       SET completed = COALESCE($1, completed),
           notes = COALESCE($2, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [completed, notes, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json({ 
      message: 'Workout updated successfully',
      workout: result.rows[0]
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ error: 'Failed to update workout' });
  } finally {
    client.release();
  }
};
