# Testing Guide

## Manual Testing Checklist

### 1. Backend Setup (Local)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your PostgreSQL credentials and OpenAI key
# Minimum required:
# - DATABASE_URL=postgresql://user:pass@localhost:5432/fitness_app
# - JWT_SECRET=any-random-secret-key
# - OPENAI_API_KEY=your-openai-key

# Initialize database (creates tables and admin user)
npm run init-db

# Start backend server
npm start
# Server should start on http://localhost:5000
```

### 2. Frontend Setup (Local)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
# Frontend should start on http://localhost:5173
```

### 3. Test User Flow

#### Test 1: User Signup
1. Go to http://localhost:5173
2. Click "Sign up"
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
4. Click "Sign Up"
5. Should redirect to intake form

#### Test 2: Intake Form
1. Fill out Step 1 (Basic Info):
   - Age: 25
   - Weight: 70
   - Height: 175
   - Fitness Level: Intermediate
   - Goals: Build muscle and improve endurance
2. Click "Next Step"
3. Fill out Step 2 (Workout Preferences):
   - Activity Style: Mixed
   - Equipment: Dumbbells, Resistance Bands
   - Location: Home
   - Days Per Week: 3
   - Workout Days: Monday, Wednesday, Friday
4. Click "Generate Workout Plan"
5. Should see OpenAI generating a workout plan
6. Should redirect to dashboard

#### Test 3: Dashboard
1. Verify dashboard displays:
   - Today's workout (if today is one of your workout days)
   - Workout history
   - Goals section
2. Click "View Full Plan" to see complete workout details
3. Click "Download PDF" to download workout plan
4. Click "Regenerate Plan" to create a new workout

#### Test 4: Goals Management
1. Click "Manage" in Goals section
2. Click "+ Add New Goal"
3. Fill in:
   - Goal Type: Muscle Gain
   - Target Value: 75kg
   - Current Value: 70kg
   - Deadline: (select future date)
4. Click "Create Goal"
5. Verify goal appears in list
6. Click "Update Progress" and enter new current value

#### Test 5: Settings/Profile
1. Click "Settings" in header
2. Update profile information:
   - Change name
   - Update fitness metrics
3. Click "Save Changes"
4. Verify success message

#### Test 6: Admin Login
1. Logout
2. Login with:
   - Email: admin@fitnessapp.com
   - Password: (check ADMIN_PASSWORD in backend/.env)
3. Verify admin account can access dashboard

### 4. API Testing with curl

#### Health Check
```bash
curl http://localhost:5000/api/health
```

#### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "password123",
    "name": "Test User 2"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "password123"
  }'
```

Save the returned token for authenticated requests.

#### Get Profile (with JWT)
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Generate Workout (with JWT)
```bash
curl -X POST http://localhost:5000/api/workouts/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_style": "Strength Training",
    "equipment_available": ["Dumbbells", "Bench"],
    "workout_location": "Gym",
    "days_per_week": 4,
    "workout_days": ["Monday", "Tuesday", "Thursday", "Friday"]
  }'
```

### 5. Rate Limiting Tests

Try making multiple requests rapidly to test rate limiting:

```bash
# Try 6 login attempts in quick succession (should be rate limited after 5)
for i in {1..6}; do
  echo "Attempt $i"
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo ""
done
```

You should see a rate limit error on the 6th attempt.

### 6. Database Verification

Connect to PostgreSQL and verify data:

```bash
psql -d fitness_app

# Check users
SELECT id, email, name, role FROM users;

# Check workouts
SELECT id, user_id, activity_style, created_at FROM workout_generations;

# Check goals
SELECT id, user_id, goal_type, target_value, status FROM goals;
```

## Expected Results

- ✅ User can sign up and login
- ✅ Multi-step intake form saves user preferences
- ✅ OpenAI generates personalized workout plans
- ✅ PDF download works
- ✅ Goals can be created, updated, and tracked
- ✅ Profile can be updated
- ✅ Rate limiting prevents abuse
- ✅ JWT authentication protects routes
- ✅ Admin account has access

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Ensure database exists: `createdb fitness_app`

### OpenAI API Error
- Verify OPENAI_API_KEY is set correctly
- Check you have API credits available
- Ensure key has proper permissions

### CORS Error
- Verify FRONTEND_URL in backend/.env matches frontend URL
- Check backend is running on expected port

### JWT Error
- Ensure JWT_SECRET is set in backend/.env
- Check token hasn't expired (7 day expiry)
- Verify Authorization header format: "Bearer <token>"

## Production Testing Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a strong random value
- [ ] Set strong ADMIN_PASSWORD
- [ ] Configure DATABASE_URL for production database
- [ ] Set NODE_ENV=production
- [ ] Verify CORS allows only production frontend URL
- [ ] Test all features in production environment
- [ ] Monitor rate limiting logs
- [ ] Verify HTTPS is enabled
- [ ] Test PDF generation with real OpenAI key
