import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalsAPI } from '../services/api';

const Goals = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const [goalType, setGoalType] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await goalsAPI.getGoals();
      setGoals(response.data.goals);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await goalsAPI.createGoal({
        goal_type: goalType,
        target_value: targetValue,
        current_value: currentValue,
        deadline: deadline || null
      });

      setGoalType('');
      setTargetValue('');
      setCurrentValue('');
      setDeadline('');
      setShowForm(false);
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create goal');
    }
  };

  const handleUpdateGoal = async (id, updates) => {
    try {
      await goalsAPI.updateGoal(id, updates);
      fetchGoals();
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalsAPI.deleteGoal(id);
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Goals</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            {showForm ? 'Cancel' : '+ Add New Goal'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Type
                </label>
                <input
                  type="text"
                  required
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="E.g., Weight Loss, Muscle Gain, Run 5K"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Value
                  </label>
                  <input
                    type="text"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="E.g., 70kg, 10 pull-ups"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Value
                  </label>
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="E.g., 80kg, 5 pull-ups"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Create Goal
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {goals.length > 0 ? (
            goals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{goal.goal_type}</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Target:</span> {goal.target_value}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Current:</span> {goal.current_value || 'Not set'}
                      </p>
                      {goal.deadline && (
                        <p className="text-gray-600">
                          <span className="font-medium">Deadline:</span>{' '}
                          {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-gray-600">
                        <span className="font-medium">Status:</span>{' '}
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs ${
                            goal.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {goal.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>

                <div className="border-t pt-4">
                  <button
                    onClick={() => {
                      const newValue = prompt('Enter current value:');
                      if (newValue) {
                        handleUpdateGoal(goal.id, { current_value: newValue });
                      }
                    }}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                  >
                    Update Progress
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 mb-4">No goals yet. Start by creating your first goal!</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Create Your First Goal
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Goals;
