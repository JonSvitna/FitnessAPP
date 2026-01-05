# FitnessAPP - AI-Powered Workout Generator

A modern, AI-powered fitness application that generates personalized workout plans using OpenAI. Built with a separated frontend (React + Vite + Tailwind CSS) and backend (Node.js + Express + PostgreSQL) architecture for ease of deployment on Railway platform.

## Features

- 🤖 **AI-Powered Workout Generation**: Uses OpenAI to create personalized workout plans
- 📋 **Multi-Step Intake Form**: Collects user information and workout preferences
- 📄 **PDF Export**: Download workout plans as PDF documents
- 👤 **User Authentication**: JWT-based authentication with secure user accounts
- 🎯 **Goal Tracking**: Set and track fitness goals
- 📊 **Dashboard**: View today's workouts, history, and progress
- 🔐 **Admin Account**: Dedicated admin access (username: mectoadmin)
- 🎨 **Modern UI**: Built with React, Vite, and Tailwind CSS
- 🗄️ **PostgreSQL Database**: Robust data persistence

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API requests

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **OpenAI API** - Workout generation
- **JWT** - Authentication
- **PDFKit** - PDF generation
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL database
- OpenAI API key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/JonSvitna/FitnessAPP.git
cd FitnessAPP
```

### 2. Install dependencies

```bash
npm run install:all
```

This will install dependencies for both frontend and backend.

### 3. Set up environment variables

#### Backend (.env)

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/fitness_app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

# Admin Password (for mectoadmin)
ADMIN_PASSWORD=YourSecureAdminPassword123!

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```bash
cd ../frontend
cp .env.example .env
```

Edit the `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Initialize the database

```bash
npm run init-db
```

This will create all necessary tables and the admin user.

## Development

Run both frontend and backend in development mode:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

- Frontend will be available at: http://localhost:5173
- Backend API will be available at: http://localhost:5000

## Database Schema

The application uses the following tables:

- **users** - User accounts with authentication
- **user_profiles** - Extended user information (age, weight, fitness level, etc.)
- **workout_generations** - AI-generated workout plans
- **workouts** - Individual workout entries by day
- **goals** - User fitness goals

## Admin Account

After running the database initialization script, an admin account is created:

- **Email**: admin@fitnessapp.com
- **Username**: mectoadmin
- **Password**: Set via `ADMIN_PASSWORD` in backend `.env` (default: Admin@12345)

⚠️ **Important**: Change the admin password before deploying to production!

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires JWT)
- `PUT /api/auth/profile` - Update user profile (requires JWT)

### Workouts
- `POST /api/workouts/generate` - Generate new workout plan with OpenAI
- `GET /api/workouts/history` - Get workout history
- `GET /api/workouts/today` - Get today's workout
- `GET /api/workouts/:id` - Get specific workout
- `GET /api/workouts/:id/pdf` - Download workout as PDF
- `PUT /api/workouts/:id` - Update workout (mark as completed, add notes)

### Goals
- `GET /api/goals` - Get all user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

## Deployment on Railway

### 1. Create a Railway account
Sign up at [railway.app](https://railway.app)

### 2. Create a new project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Connect your GitHub account and select the FitnessAPP repository

### 3. Add PostgreSQL database
- In your Railway project, click "New"
- Select "Database" → "PostgreSQL"
- Railway will automatically create and configure the database

### 4. Configure backend service
- Add a new service for the backend
- Set root directory to `/backend`
- Set build command: `npm install`
- Set start command: `npm start`
- Add environment variables from backend `.env.example`
- Set `DATABASE_URL` to the PostgreSQL connection string from Railway

### 5. Configure frontend service
- Add a new service for the frontend
- Set root directory to `/frontend`
- Set build command: `npm run build`
- Set start command: `npm start`
- Add `VITE_API_URL` pointing to your backend URL

### 6. Initialize the database
After deployment, run the database initialization:
```bash
railway run npm run init-db
```

### 7. Configure CORS
Update the `FRONTEND_URL` in backend environment variables to match your deployed frontend URL.

## Project Structure

```
FitnessAPP/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── workoutController.js
│   │   │   └── goalsController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── workoutRoutes.js
│   │   │   └── goalsRoutes.js
│   │   ├── utils/
│   │   │   └── initDatabase.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── IntakeForm.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Goals.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── package.json
└── README.md
```

## User Flow

1. **Sign Up**: New users create an account with email and password
2. **Intake Form**: Multi-step form collects:
   - Basic info (age, weight, height, fitness level, goals)
   - Workout preferences (activity style, equipment, location, days per week)
3. **AI Generation**: OpenAI generates a personalized workout plan
4. **Dashboard**: Users see:
   - Today's workout
   - Workout history
   - Goals
   - Quick actions (regenerate, download PDF)
5. **Settings**: Users can update their profile and preferences
6. **Goals**: Track and manage fitness goals

## Security Features

- ✅ JWT authentication for all protected routes
- ✅ Password hashing with bcryptjs
- ✅ CORS configuration for frontend-backend communication
- ✅ SQL injection prevention with parameterized queries
- ✅ Environment variable management for sensitive data
- ✅ Admin role separation

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Note**: Remember to keep your OpenAI API key and JWT secret secure. Never commit `.env` files to version control.
