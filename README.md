# FitnessAPP

A modern fitness tracking web application built with Node.js and Express. Track your workouts, calories, steps, and activity history.

## Features

- 📊 Track daily stats (calories, steps, minutes, workouts)
- 🏋️ Quick workout buttons for common exercises
- 📝 Log custom activities with duration and calories
- 📱 Progressive Web App (PWA) - installable on mobile devices
- 🌙 Dark mode support
- 💾 Data persistence using local storage

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **PWA**: Service Worker for offline support

## Local Development

### Prerequisites

- Node.js 18.0.0 or higher
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/JonSvitna/FitnessAPP.git
   cd FitnessAPP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Deploy to Render

### Option 1: One-Click Deploy

1. Fork this repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Connect your GitHub account and select your forked repository
5. Render will automatically detect the `render.yaml` and deploy the app

### Option 2: Manual Deploy

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: fitness-app
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click "Create Web Service"

## API Endpoints

- `GET /` - Serves the main application
- `GET /api/health` - Health check endpoint for monitoring

## Project Structure

```
FitnessAPP/
├── server.js          # Express server
├── package.json       # Dependencies and scripts
├── render.yaml        # Render deployment configuration
└── public/
    ├── index.html     # Main HTML file
    ├── styles.css     # Stylesheet
    ├── app.js         # Frontend JavaScript
    ├── manifest.json  # PWA manifest
    └── sw.js          # Service Worker
```

## License

MIT License - see [LICENSE](LICENSE) for details
