const pool = require('../config/database');

// Get all goals
exports.getGoals = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT * FROM goals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ goals: result.rows });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to get goals' });
  } finally {
    client.release();
  }
};

// Create goal
exports.createGoal = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { goal_type, target_value, current_value, deadline } = req.body;

    if (!goal_type || !target_value) {
      return res.status(400).json({ error: 'Goal type and target value are required' });
    }

    const result = await client.query(
      `INSERT INTO goals (user_id, goal_type, target_value, current_value, deadline)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, goal_type, target_value, current_value, deadline]
    );

    res.status(201).json({
      message: 'Goal created successfully',
      goal: result.rows[0]
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  } finally {
    client.release();
  }
};

// Update goal
exports.updateGoal = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { current_value, status, deadline } = req.body;

    const result = await client.query(
      `UPDATE goals
       SET current_value = COALESCE($1, current_value),
           status = COALESCE($2, status),
           deadline = COALESCE($3, deadline),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [current_value, status, deadline, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({
      message: 'Goal updated successfully',
      goal: result.rows[0]
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  } finally {
    client.release();
  }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    const result = await client.query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  } finally {
    client.release();
  }
};
