import React, { useState, useEffect, useMemo } from 'react';
import { api, PREDICTION_TIMEOUT_MS } from '../apiClient';
import PageLayout from './PageLayout';

const DEFAULT_VALUES = {
  Gender: 'Male',
  Occupation: 'Doctor',
  'BMI Category': 'Normal',
  'Blood Pressure': '125/80',
  Age: 25,
  'Sleep Duration': 7,
  'Quality of Sleep': 3,
  'Physical Activity Level': 30,
};

const FEATURE_ORDER = [
  'Gender',
  'Occupation',
  'BMI Category',
  'Blood Pressure',
  'Age',
  'Sleep Duration',
  'Quality of Sleep',
  'Physical Activity Level',
];

const SELECT_CONFIG = [
  { label: 'Gender', optionsKey: 'genders' },
  { label: 'Occupation', optionsKey: 'occupations' },
  { label: 'BMI Category', optionsKey: 'bmiCategories' },
  { label: 'Blood Pressure', optionsKey: 'bloodPressures' },
];

const NUMBER_FIELDS = ['Age', 'Sleep Duration', 'Quality of Sleep', 'Physical Activity Level'];

function hintForResult(prediction) {
  if (!prediction || typeof prediction !== 'string') return null;
  const p = prediction.toLowerCase();
  if (p.includes('none') || p.includes('no disorder')) {
    return 'This model’s output is for exploration only — not a diagnosis. Talk to a clinician about ongoing sleep concerns.';
  }
  if (p.includes('insomnia')) {
    return 'Consider sleep hygiene and professional guidance if symptoms persist. This result is not medical advice.';
  }
  if (p.includes('apnea')) {
    return 'Sleep apnea often needs clinical evaluation. Use this insight as a conversation starter with a healthcare provider.';
  }
  return 'Use this as a wellness signal only; it does not replace medical assessment.';
}

function SleepPrediction() {
  const [form, setForm] = useState({
    Gender: '',
    Occupation: '',
    'BMI Category': '',
    'Blood Pressure': '',
    Age: '',
    'Sleep Duration': '',
    'Quality of Sleep': '',
    'Physical Activity Level': '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refLoading, setRefLoading] = useState(true);
  const [refError, setRefError] = useState(null);
  const [refData, setRefData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/api/content/reference/sleep-prediction-form');
        if (!cancelled) {
          setRefData(res.data && typeof res.data === 'object' ? res.data : null);
          setRefError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setRefError(
            'Could not load form options. Start the Spring backend (port 8080) with a seeded database.'
          );
          setRefData(null);
        }
      } finally {
        if (!cancelled) setRefLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resultHint = useMemo(() => hintForResult(result), [result]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const payload = {
        features: FEATURE_ORDER.map((key) => {
          const value = form[key] !== '' && form[key] !== undefined ? form[key] : DEFAULT_VALUES[key];
          const num = Number(value);
          return Number.isNaN(num) ? value : num;
        }),
      };

      const res = await api.post(
        '/api/auth/pred',
        { payload },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: PREDICTION_TIMEOUT_MS,
        }
      );

      if (res.data?.error) {
        setError(res.data.error);
        setResult(null);
        return;
      }

      const pred = res.data?.prediction ?? null;
      if (pred == null || pred === '') {
        setError('Unexpected response from the server. Is the Python ML service running on port 5002?');
        setResult(null);
        return;
      }

      setResult(String(pred));
      setError(null);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.code === 'ECONNABORTED'
          ? 'The model took too long. Ensure Python is running and try again.'
          : err.message) ||
        'Prediction failed.';
      setError(typeof msg === 'string' ? msg : 'Prediction failed.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Sleep insight lab"
      subtitle="Random forest model served via Python. Empty fields use safe defaults aligned with the model."
      wide
    >
      <div className="sleep-ml-banner" role="note">
        <strong>Stack check:</strong> Spring (8080) forwards to Python (5002). If you see connection errors, run{' '}
        <code className="sleep-code">python-server</code> and confirm <code className="sleep-code">ml.service.url</code>{' '}
        in the backend.
      </div>

      {refLoading && <p className="page-shell__subtitle">Loading form…</p>}
      {refError && (
        <div className="page-alert page-alert--error" role="alert">
          {refError}
        </div>
      )}

      {!refLoading && refData && (
        <form onSubmit={handleSubmit} className="sleep-form">
          <div className="sleep-section">
            <h2 className="sleep-section__title">About you</h2>
            <p className="sleep-section__sub">Categorical fields must match training data (from the server).</p>
            <div className="page-form-grid">
              {SELECT_CONFIG.map(({ label, optionsKey }) => {
                const options = Array.isArray(refData[optionsKey]) ? refData[optionsKey] : [];
                return (
                  <div key={label} className="page-field">
                    <label htmlFor={`sleep-${label}`}>{label}</label>
                    <select
                      id={`sleep-${label}`}
                      className="page-select"
                      onChange={(e) => handleChange(label, e.target.value)}
                      value={form[label]}
                    >
                      <option value="">Use default</option>
                      {options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sleep-section">
            <h2 className="sleep-section__title">Sleep &amp; activity</h2>
            <div className="page-form-grid">
              {NUMBER_FIELDS.map((field) => (
                <div key={field} className="page-field">
                  <label htmlFor={`sleep-${field}`}>{field}</label>
                  <input
                    id={`sleep-${field}`}
                    type="number"
                    className="page-input"
                    value={form[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    min={field === 'Quality of Sleep' ? 1 : field === 'Age' ? 1 : 0}
                    max={field === 'Quality of Sleep' ? 10 : undefined}
                    step={field === 'Sleep Duration' ? 0.1 : 1}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="sleep-actions">
            <button type="submit" className="page-btn-primary" disabled={loading}>
              {loading ? 'Running model…' : 'Get insight'}
            </button>
          </div>
        </form>
      )}

      {result != null && (
        <div className="sleep-result" role="status">
          <p className="sleep-result__label">Model output</p>
          <p className="sleep-result__value">{result}</p>
          {resultHint && <p className="sleep-result__hint">{resultHint}</p>}
        </div>
      )}

      {error && (
        <div className="page-alert page-alert--error" role="alert">
          {error}
        </div>
      )}
    </PageLayout>
  );
}

export default SleepPrediction;
