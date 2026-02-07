import React, { useState, useEffect } from 'react';

const PROFILE_STORAGE_KEY = 'wellness_profile';

function loadStoredProfile() {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...getEmptyProfile(), ...parsed };
    }
  } catch (_) {}
  return null;
}

function getEmptyProfile() {
  return {
    name: '',
    email: '',
    age: '',
    gender: '',
    occupation: '',
    height: '',
    weight: '',
    sleepGoal: '',
    fitnessGoal: '',
    mentalWellbeingGoal: '',
    wakeUpTime: '',
    bedTime: '',
    mealsPerDay: '',
    dietaryPreference: '',
    stressLevel: '',
    meditationHabit: '',
    waterIntake: '',
    exerciseFrequency: '',
  };
}

function ProfilePage() {
  const [profile, setProfile] = useState(getEmptyProfile());
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const stored = loadStoredProfile();
    const email = localStorage.getItem('userEmail') || '';
    const name = (typeof stored?.name === 'string' && stored.name) ? stored.name : '';
    setProfile((prev) => ({
      ...prev,
      ...(stored || {}),
      email: email || (stored && stored.email) || prev.email,
      name: name || prev.name,
    }));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaveMessage('');
  };

  const handleSubmit = () => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      setSaveMessage('Profile saved.');
    } catch (_) {
      setSaveMessage('Failed to save.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>🌱 Your Wellness Profile</h2>

        <div style={styles.grid}>
          {/* Basic Details */}
          {[
            { label: 'Full Name', name: 'name' },
            { label: 'Email', name: 'email' },
            { label: 'Age', name: 'age', type: 'number' },
            { label: 'Gender', name: 'gender' },
            { label: 'Occupation', name: 'occupation' },
            { label: 'Height (cm)', name: 'height', type: 'number' },
            { label: 'Weight (kg)', name: 'weight', type: 'number' }
          ].map(({ label, name, type = 'text' }) => (
            <div key={name} style={styles.fieldGroup}>
              <label style={styles.label}>{label}</label>
              <input
                name={name}
                value={profile[name]}
                type={type}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          ))}

          {/* Goals */}
          {[
            { label: 'Sleep Goal (hrs)', name: 'sleepGoal', type: 'number' },
            { label: 'Fitness Goal', name: 'fitnessGoal' },
            { label: 'Mental Wellbeing Goal', name: 'mentalWellbeingGoal' }
          ].map(({ label, name, type = 'text' }) => (
            <div key={name} style={styles.fieldGroup}>
              <label style={styles.label}>{label}</label>
              <input
                name={name}
                value={profile[name]}
                type={type}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          ))}

          {/* Wellness Routine Questions */}
          {[
            { label: 'Usual Wake-up Time', name: 'wakeUpTime', type: 'time' },
            { label: 'Usual Bed Time', name: 'bedTime', type: 'time' },
            { label: 'How many meals do you eat per day?', name: 'mealsPerDay', type: 'number' },
            { label: 'Dietary Preference (e.g., Veg, Vegan, Non-veg)', name: 'dietaryPreference' },
            { label: 'Average daily water intake (in liters)', name: 'waterIntake', type: 'number' },
            { label: 'How often do you exercise per week?', name: 'exerciseFrequency' },
            { label: 'Stress level (Low / Medium / High)', name: 'stressLevel' },
            { label: 'Do you practice meditation? (Yes / No / Occasionally)', name: 'meditationHabit' }
          ].map(({ label, name, type = 'text' }) => (
            <div key={name} style={styles.fieldGroup}>
              <label style={styles.label}>{label}</label>
              <input
                name={name}
                value={profile[name]}
                type={type}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          ))}
        </div>

        {saveMessage && (
          <p style={{ marginTop: '1rem', textAlign: 'center', color: saveMessage === 'Profile saved.' ? '#28a745' : '#dc3545' }}>
            {saveMessage}
          </p>
        )}
        <button onClick={handleSubmit} style={styles.submitButton}>
          Save Profile
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#f4f7fa',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    padding: '2rem',
    width: '100%',
    maxWidth: '800px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem 2rem',
    marginBottom: '1.5rem'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '0.4rem',
    fontWeight: '500',
    color: '#444'
  },
  input: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  },
  submitButton: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1.1rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};

export default ProfilePage;
