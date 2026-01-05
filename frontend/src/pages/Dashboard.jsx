import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutAPI, goalsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [todaysWorkout, setTodaysWorkout] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [todayRes, historyRes, goalsRes] = await Promise.all([
        workoutAPI.getToday(),
        workoutAPI.getHistory(),
        goalsAPI.getGoals()
      ]);

      setTodaysWorkout(todayRes.data.workouts[0] || null);
      setWorkoutHistory(historyRes.data.workouts);
      setGoals(goalsRes.data.goals);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateWorkout = () => {
    navigate('/intake');
  };

  const handleDownloadPDF = async (workoutId) => {
    try {
      const response = await workoutAPI.getPDF(workoutId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `workout-plan-${workoutId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download workout PDF');
    }
  };

  const handleViewWorkout = async (id) => {
    try {
      const response = await workoutAPI.getWorkout(id);
      setSelectedWorkout(response.data.workout);
    } catch (error) {
      console.error('Failed to fetch workout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏋️ Fitness Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/settings')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Settings
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Workout */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Today's Workout</h2>
                <button
                  onClick={handleRegenerateWorkout}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Regenerate Plan
                </button>
              </div>

              {todaysWorkout ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-blue-900">
                        {todaysWorkout.activity_style || 'Workout'}
                      </h3>
                      <span className="text-sm text-blue-600">{todaysWorkout.day_of_week}</span>
                    </div>
                    <div className="text-sm text-blue-800 whitespace-pre-wrap">
                      {todaysWorkout.workout_plan?.substring(0, 300)}...
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleViewWorkout(todaysWorkout.generation_id)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      View Full Plan
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(todaysWorkout.generation_id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No workout plan generated yet</p>
                  <button
                    onClick={handleRegenerateWorkout}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Your First Workout Plan
                  </button>
                </div>
              )}
            </div>

            {/* Workout History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Workout History</h2>
              {workoutHistory.length > 0 ? (
                <div className="space-y-3">
                  {workoutHistory.map((workout) => (
                    <div
                      key={workout.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer"
                      onClick={() => handleViewWorkout(workout.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{workout.activity_style}</h3>
                          <p className="text-sm text-gray-600">
                            {workout.workout_location} • {workout.days_per_week} days/week
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(workout.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF(workout.id);
                          }}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No workout history yet</p>
              )}
            </div>
          </div>

          {/* Goals Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Goals</h2>
                <button
                  onClick={() => navigate('/goals')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Manage
                </button>
              </div>

              {goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.slice(0, 5).map((goal) => (
                    <div key={goal.id} className="border-l-4 border-blue-500 pl-3 py-2">
                      <h3 className="font-semibold text-gray-800 text-sm">{goal.goal_type}</h3>
                      <p className="text-xs text-gray-600">Target: {goal.target_value}</p>
                      <p className="text-xs text-gray-500">Current: {goal.current_value || 'Not set'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 text-sm mb-2">No goals set yet</p>
                  <button
                    onClick={() => navigate('/goals')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Add Your First Goal
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Workouts</span>
                  <span className="font-bold text-blue-600">{workoutHistory.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Goals</span>
                  <span className="font-bold text-blue-600">
                    {goals.filter(g => g.status === 'active').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Workout Plan Details</h2>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Activity:</span> {selectedWorkout.activity_style}
                </div>
                <div>
                  <span className="font-semibold">Location:</span> {selectedWorkout.workout_location}
                </div>
                <div>
                  <span className="font-semibold">Days/Week:</span> {selectedWorkout.days_per_week}
                </div>
                <div>
                  <span className="font-semibold">Created:</span>{' '}
                  {new Date(selectedWorkout.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Workout Plan:</h3>
                <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-sm">
                  {selectedWorkout.workout_plan}
                </div>
              </div>

              <button
                onClick={() => handleDownloadPDF(selectedWorkout.id)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Download as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
