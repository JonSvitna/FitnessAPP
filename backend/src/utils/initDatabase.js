const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Creating database tables...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Create user_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        age INTEGER,
        weight DECIMAL(5,2),
        height DECIMAL(5,2),
        fitness_level VARCHAR(50),
        goals TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ User profiles table created');

    // Create workout_generations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workout_generations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        activity_style VARCHAR(255),
        equipment_available TEXT[],
        workout_location VARCHAR(50),
        days_per_week INTEGER,
        workout_days TEXT[],
        workout_plan TEXT,
        pdf_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Workout generations table created');

    // Create workouts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workouts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        generation_id INTEGER REFERENCES workout_generations(id) ON DELETE CASCADE,
        day_of_week VARCHAR(20),
        workout_date DATE,
        exercises JSONB,
        completed BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Workouts table created');

    // Create goals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        goal_type VARCHAR(100),
        target_value VARCHAR(255),
        current_value VARCHAR(255),
        deadline DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Goals table created');

    // Check if admin user exists
    const adminCheck = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@fitnessapp.com']
    );

    if (adminCheck.rows.length === 0) {
      // Create admin user
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', 10);
      await client.query(
        `INSERT INTO users (email, password, name, role) 
         VALUES ($1, $2, $3, $4)`,
        ['admin@fitnessapp.com', hashedPassword, 'mectoadmin', 'admin']
      );
      console.log('✓ Admin user created (mectoadmin)');
      console.log('  Email: admin@fitnessapp.com');
      console.log('  Default password: Check ADMIN_PASSWORD in .env or use Admin@12345');
    } else {
      console.log('✓ Admin user already exists');
    }

    console.log('\nDatabase initialization completed successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run if called directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}

module.exports = createTables;
