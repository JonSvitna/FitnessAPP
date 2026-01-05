import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, workoutAPI } from '../services/api';

const IntakeForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Basic Info
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [goals, setGoals] = useState('');

  // Step 2: Workout Preferences
  const [activityStyle, setActivityStyle] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [location, setLocation] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const [workoutDays, setWorkoutDays] = useState([]);

  const equipmentOptions = [
    'Dumbbells',
    'Barbell',
    'Resistance Bands',
    'Pull-up Bar',
    'Kettlebells',
    'Yoga Mat',
    'Bench',
    'None'
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleEquipment = (item) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter(e => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const toggleDay = (day) => {
    if (workoutDays.includes(day)) {
      setWorkoutDays(workoutDays.filter(d => d !== day));
    } else {
      setWorkoutDays([...workoutDays, day]);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      // Save profile info
      try {
        await authAPI.updateProfile({
          age: parseInt(age),
          weight: parseFloat(weight),
          height: parseFloat(height),
          fitness_level: fitnessLevel,
          goals
        });
        setStep(2);
      } catch (err) {
        setError('Failed to save profile. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Generate workout plan
      const response = await workoutAPI.generate({
        activity_style: activityStyle,
        equipment_available: equipment,
        workout_location: location,
        days_per_week: parseInt(daysPerWeek),
        workout_days: workoutDays,
        user_info: {
          age,
          weight,
          height,
          fitness_level: fitnessLevel,
          goals
        }
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate workout plan');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {step} of 2</span>
              <span className="text-sm text-gray-500">{step === 1 ? 'Basic Info' : 'Workout Preferences'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tell us about yourself</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="70"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="175"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fitness Level
                  </label>
                  <select
                    required
                    value={fitnessLevel}
                    onChange={(e) => setFitnessLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fitness Goals
                </label>
                <textarea
                  required
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="E.g., Lose weight, build muscle, improve endurance..."
                ></textarea>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={!age || !weight || !height || !fitnessLevel || !goals}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Next Step
              </button>
            </div>
          )}

          {/* Step 2: Workout Preferences */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Workout Preferences</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Style
                </label>
                <select
                  required
                  value={activityStyle}
                  onChange={(e) => setActivityStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select style</option>
                  <option value="Strength Training">Strength Training</option>
                  <option value="Cardio">Cardio</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Available (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {equipmentOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleEquipment(item)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        equipment.includes(item)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Location
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setLocation('Home')}
                    className={`px-4 py-3 rounded-md font-medium transition-colors ${
                      location === 'Home'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🏠 Home
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocation('Gym')}
                    className={`px-4 py-3 rounded-md font-medium transition-colors ${
                      location === 'Gym'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🏋️ Gym
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days Per Week
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="7"
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Workout Days
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        workoutDays.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !activityStyle || !location || !daysPerWeek}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Generating Workout...' : 'Generate Workout Plan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntakeForm;
