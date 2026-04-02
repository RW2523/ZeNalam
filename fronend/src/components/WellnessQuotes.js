import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faRefresh, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../apiClient';
import './WellnessQuotes.css';

const PALETTE = ['#1a2744', '#c9a227', '#243352', '#8a7020', '#3d5a80', '#ee9b00'];

const WellnessQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState({ labels: [], values: [] });
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [qRes, wRes] = await Promise.all([
          api.get('/api/content/quotes'),
          api.get('/api/workout-distribution'),
        ]);
        if (!cancelled) {
          setQuotes(Array.isArray(qRes.data) ? qRes.data : []);
          const w = wRes.data || {};
          setWorkout({
            labels: Array.isArray(w.labels) ? w.labels : [],
            values: Array.isArray(w.values) ? w.values.map((v) => Number(v)) : [],
          });
        }
      } catch (e) {
        if (!cancelled) {
          setQuotes([]);
          setWorkout({ labels: [], values: [] });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const conicGradient = useMemo(() => {
    const { labels, values } = workout;
    if (!labels.length || !values.length) return 'conic-gradient(var(--zen-border) 0% 100%)';
    const total = values.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
    if (total <= 0) return 'conic-gradient(var(--zen-border) 0% 100%)';
    let acc = 0;
    const stops = values.map((v, i) => {
      const pct = ((Number.isFinite(v) ? v : 0) / total) * 100;
      const start = acc;
      acc += pct;
      const color = PALETTE[i % PALETTE.length];
      return `${color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }, [workout]);

  useEffect(() => {
    let interval;
    if (!isPaused && quotes.length > 0) {
      interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % quotes.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPaused, quotes.length]);

  const current = quotes[index] || { text: '', type: '' };

  const handleMealLog = (e) => {
    e.preventDefault();
    navigate('/meal');
  };

  return (
    <div className="wq-wrap" style={{ padding: 'inherit' }}>
      {loading && <p className="wq-loading">Loading tips…</p>}

      {!loading && quotes.length > 0 && (
        <div className="wq-section wq-section--quote">
          <p className="wq-quote-text">&ldquo;{current.text}&rdquo;</p>
          <span className="wq-quote-type">{current.type}</span>
          <div className="wq-icons">
            <button type="button" className="wq-icon-btn" onClick={() => setIsPaused(!isPaused)} aria-label={isPaused ? 'Play' : 'Pause'}>
              <FontAwesomeIcon icon={isPaused ? faPlay : faPause} />
            </button>
            <button
              type="button"
              className="wq-icon-btn"
              onClick={() => setIndex(Math.floor(Math.random() * quotes.length))}
              aria-label="New quote"
            >
              <FontAwesomeIcon icon={faRefresh} />
            </button>
          </div>
        </div>
      )}

      {!loading && quotes.length === 0 && (
        <div className="wq-section">
          <p className="wq-muted">Wellness tips will appear here once the database is seeded.</p>
        </div>
      )}

      <div className="wq-section wq-workout-row">
        {workout.labels.length > 0 ? (
          <>
            <div className="wq-chart-circle" style={{ background: conicGradient }}>
              <div className="wq-chart-center" />
            </div>
            <ul className="wq-progress-list">
              {workout.labels.map((label, i) => (
                <li key={label + i}>
                  <span className="wq-dot" style={{ background: PALETTE[i % PALETTE.length] }} />
                  {label} · {workout.values[i] ?? 0}%
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="wq-muted">Workout mix loads from your overview data.</p>
        )}
      </div>

      <div className="wq-section">
        <h3 className="wq-meal-title">Meal logger</h3>
        <p className="wq-meal-desc">Track meals with photo classification or manual entry.</p>
        <button type="button" className="wq-meal-btn" onClick={handleMealLog}>
          <FontAwesomeIcon icon={faUtensils} />
          Log a meal
        </button>
      </div>
    </div>
  );
};

export default WellnessQuotes;
