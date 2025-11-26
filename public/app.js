// Fitness App JavaScript

// State management
const state = {
    calories: 0,
    steps: 0,
    minutes: 0,
    workouts: 0,
    activities: []
};

// Activity icons mapping
const activityIcons = {
    running: '🏃',
    walking: '🚶',
    cycling: '🚴',
    swimming: '🏊',
    weightlifting: '🏋️',
    yoga: '🧘',
    cardio: '❤️',
    strength: '💪',
    hiit: '⚡',
    other: '🎯'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateUI();
});

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('fitnessAppState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        Object.assign(state, parsed);
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('fitnessAppState', JSON.stringify(state));
}

// Update UI elements
function updateUI() {
    document.getElementById('calories').textContent = state.calories.toLocaleString();
    document.getElementById('steps').textContent = state.steps.toLocaleString();
    document.getElementById('minutes').textContent = state.minutes;
    document.getElementById('workouts').textContent = state.workouts;
    renderActivityHistory();
}

// Start a workout
function startWorkout(type) {
    const workoutDurations = {
        cardio: 30,
        strength: 45,
        yoga: 20,
        hiit: 15
    };

    const caloriesPerMinute = {
        cardio: 10,
        strength: 8,
        yoga: 4,
        hiit: 15
    };

    const duration = workoutDurations[type] || 30;
    const calories = duration * (caloriesPerMinute[type] || 8);

    const activity = {
        id: Date.now(),
        type: type,
        duration: duration,
        calories: calories,
        timestamp: new Date().toISOString()
    };

    state.activities.unshift(activity);
    state.workouts++;
    state.minutes += duration;
    state.calories += calories;

    saveState();
    updateUI();
    showToast(`Started ${type} workout! ${duration} min, ${calories} cal`);
}

// Log a custom activity
function logActivity(event) {
    event.preventDefault();

    const type = document.getElementById('activity-type').value;
    const duration = parseInt(document.getElementById('duration').value, 10);
    const caloriesBurned = parseInt(document.getElementById('calories-burned').value, 10) || estimateCalories(type, duration);

    if (!type || !duration) {
        showToast('Please fill in all required fields');
        return;
    }

    const activity = {
        id: Date.now(),
        type: type,
        duration: duration,
        calories: caloriesBurned,
        timestamp: new Date().toISOString()
    };

    state.activities.unshift(activity);
    state.workouts++;
    state.minutes += duration;
    state.calories += caloriesBurned;

    // Estimate steps for walking/running
    if (type === 'walking' || type === 'running') {
        const stepsPerMinute = type === 'running' ? 150 : 100;
        state.steps += duration * stepsPerMinute;
    }

    saveState();
    updateUI();

    // Reset form
    event.target.reset();

    showToast(`Activity logged: ${type} for ${duration} min`);
}

// Estimate calories based on activity type and duration
function estimateCalories(type, duration) {
    const caloriesPerMinute = {
        running: 12,
        walking: 5,
        cycling: 8,
        swimming: 10,
        weightlifting: 6,
        yoga: 4,
        other: 6
    };

    return duration * (caloriesPerMinute[type] || 6);
}

// Render activity history
function renderActivityHistory() {
    const container = document.getElementById('activity-history');

    if (state.activities.length === 0) {
        container.innerHTML = '<p class="empty-state">No activities logged yet. Start your fitness journey!</p>';
        return;
    }

    const recentActivities = state.activities.slice(0, 10);

    container.innerHTML = recentActivities.map(activity => {
        const date = new Date(activity.timestamp);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = date.toLocaleDateString();

        return `
            <div class="activity-item">
                <span class="activity-icon">${activityIcons[activity.type] || '🎯'}</span>
                <div class="activity-details">
                    <div class="activity-name">${capitalizeFirst(activity.type)}</div>
                    <div class="activity-meta">${activity.duration} min • ${activity.calories} cal • ${dateString} ${timeString}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Show toast notification
function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Service Worker registration for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}
