const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Sign up
exports.signup = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await client.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role, created_at`,
      [email.toLowerCase(), hashedPassword, name, 'user']
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  } finally {
    client.release();
  }
};

// Login
exports.login = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await client.query(
      'SELECT id, email, password, name, role FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  } finally {
    client.release();
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT u.id, u.email, u.name, u.role, u.created_at,
              p.age, p.weight, p.height, p.fitness_level, p.goals
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    delete user.password;

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  } finally {
    client.release();
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { name, age, weight, height, fitness_level, goals } = req.body;

    await client.query('BEGIN');

    // Update user name if provided
    if (name) {
      await client.query(
        'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [name, req.user.id]
      );
    }

    // Check if profile exists
    const profileCheck = await client.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      // Create profile
      await client.query(
        `INSERT INTO user_profiles (user_id, age, weight, height, fitness_level, goals)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user.id, age, weight, height, fitness_level, goals]
      );
    } else {
      // Update profile
      await client.query(
        `UPDATE user_profiles 
         SET age = COALESCE($1, age),
             weight = COALESCE($2, weight),
             height = COALESCE($3, height),
             fitness_level = COALESCE($4, fitness_level),
             goals = COALESCE($5, goals),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $6`,
        [age, weight, height, fitness_level, goals, req.user.id]
      );
    }

    await client.query('COMMIT');

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  } finally {
    client.release();
  }
};
