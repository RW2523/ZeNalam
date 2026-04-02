import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from './PageLayout';
import { api } from '../apiClient';

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

function toStr(v) {
  if (v == null || v === undefined) return '';
  return String(v);
}

function ProfilePage() {
  const [profile, setProfile] = useState(getEmptyProfile());
  const [saveMessage, setSaveMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const userId = typeof localStorage !== 'undefined' ? localStorage.getItem('id') : null;

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoadError('Sign in to view your profile.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.get(`/api/users/${userId}`);
      const p = res.data?.profile || {};
      const base = getEmptyProfile();
      const merged = { ...base };
      merged.name = toStr(res.data?.name);
      merged.email = toStr(res.data?.email);
      Object.keys(base).forEach((k) => {
        if (k !== 'name' && k !== 'email') {
          merged[k] = toStr(p[k]);
        }
      });
      setProfile(merged);
    } catch (e) {
      setLoadError(e.response?.data?.message || e.message || 'Could not load profile.');
      setProfile(getEmptyProfile());
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaveMessage('');
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setSaveMessage('');
    try {
      const { email: _e, ...rest } = profile;
      await api.put(`/api/users/${userId}/profile`, rest);
      localStorage.setItem('userName', profile.name || '');
      setSaveMessage('Profile saved.');
    } catch (e) {
      setSaveMessage(e.response?.data?.message || e.message || 'Failed to save.');
    }
  };

  return (
    <PageLayout
      title="Your wellness profile"
      subtitle="Stored securely for your account. Update anytime."
      wide
    >
      {loading && <p className="page-shell__subtitle">Loading profile…</p>}
      {loadError && (
        <div className="page-alert page-alert--error" role="alert">
          {loadError}
        </div>
      )}
      {!loading && !loadError && (
        <>
          <div className="page-form-grid">
            {[
              { label: 'Full name', name: 'name' },
              { label: 'Email', name: 'email', readOnly: true },
              { label: 'Age', name: 'age', type: 'number' },
              { label: 'Gender', name: 'gender' },
              { label: 'Occupation', name: 'occupation' },
              { label: 'Height (cm)', name: 'height', type: 'number' },
              { label: 'Weight (kg)', name: 'weight', type: 'number' },
            ].map(({ label, name, type = 'text', readOnly }) => (
              <div key={name} className="page-field">
                <label htmlFor={`profile-${name}`}>{label}</label>
                <input
                  id={`profile-${name}`}
                  name={name}
                  value={profile[name]}
                  type={type}
                  onChange={readOnly ? undefined : handleChange}
                  readOnly={readOnly}
                  className="page-input"
                  style={readOnly ? { opacity: 0.85 } : undefined}
                />
              </div>
            ))}

            {[
              { label: 'Sleep goal (hours)', name: 'sleepGoal', type: 'number' },
              { label: 'Fitness goal', name: 'fitnessGoal' },
              { label: 'Mental wellbeing goal', name: 'mentalWellbeingGoal' },
            ].map(({ label, name, type = 'text' }) => (
              <div key={name} className="page-field">
                <label htmlFor={`profile-${name}`}>{label}</label>
                <input
                  id={`profile-${name}`}
                  name={name}
                  value={profile[name]}
                  type={type}
                  onChange={handleChange}
                  className="page-input"
                />
              </div>
            ))}

            {[
              { label: 'Usual wake-up time', name: 'wakeUpTime', type: 'time' },
              { label: 'Usual bed time', name: 'bedTime', type: 'time' },
              { label: 'Meals per day', name: 'mealsPerDay', type: 'number' },
              { label: 'Dietary preference (e.g. veg, vegan)', name: 'dietaryPreference' },
              { label: 'Daily water intake (liters)', name: 'waterIntake', type: 'number' },
              { label: 'Exercise frequency per week', name: 'exerciseFrequency' },
              { label: 'Stress level (low / medium / high)', name: 'stressLevel' },
              { label: 'Meditation (yes / no / occasionally)', name: 'meditationHabit' },
            ].map(({ label, name, type = 'text' }) => (
              <div key={name} className="page-field">
                <label htmlFor={`profile-${name}`}>{label}</label>
                <input
                  id={`profile-${name}`}
                  name={name}
                  value={profile[name]}
                  type={type}
                  onChange={handleChange}
                  className="page-input"
                />
              </div>
            ))}
          </div>

          {saveMessage && (
            <p
              className={
                saveMessage === 'Profile saved.'
                  ? 'page-alert page-alert--success'
                  : 'page-alert page-alert--error'
              }
              role="status"
            >
              {saveMessage}
            </p>
          )}
          <button type="button" className="page-btn-primary" onClick={handleSubmit}>
            Save profile
          </button>
        </>
      )}
    </PageLayout>
  );
}

export default ProfilePage;
