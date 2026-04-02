import React, { useEffect, useState, useRef } from 'react';
import { api } from '../apiClient';

function ZenMode() {
  const [breathState, setBreathState] = useState('Inhale');
  const [cycle, setCycle] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef(null);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/api/content/quotes');
        const list = Array.isArray(res.data) ? res.data : [];
        if (!cancelled && list.length > 0) {
          const pick = list[Math.floor(Math.random() * list.length)];
          setQuote(pick.text || '');
        }
      } catch {
        if (!cancelled) setQuote('Breathe in calm, breathe out stress.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathState((prev) => (prev === 'Inhale' ? 'Exhale' : 'Inhale'));
      setCycle((c) => c + 1);
    }, 4000);

    const timerInterval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => {
      clearInterval(breathInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (soundOn) {
      audioRef.current.pause();
    } else {
      audioRef.current.loop = true;
      audioRef.current.play();
    }
    setSoundOn(!soundOn);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? `0${s}` : s}s`;
  };

  return (
    <div style={styles.container}>
      <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2021/09/08/audio_8d69e1999b.mp3?filename=ocean-wave-nature-sound-6724.mp3" />

      <div style={styles.glowContainer}>
        <div
          style={{
            ...styles.circle,
            transform: breathState === 'Inhale' ? 'scale(1.2)' : 'scale(0.8)',
            backgroundColor: breathState === 'Inhale' ? 'rgba(201, 162, 39, 0.35)' : 'rgba(26, 39, 68, 0.2)',
            border: '2px solid rgba(201, 162, 39, 0.4)',
          }}
        >
          <p style={styles.breathText}>{breathState}</p>
        </div>
      </div>

      <h2 style={styles.title}>Zen mode</h2>
      <p style={styles.quote}>{quote}</p>

      <div style={styles.infoBox}>
        <p>Time elapsed: <strong>{formatTime(elapsedSeconds)}</strong></p>
        <p>Breathing cycles: <strong>{cycle}</strong></p>
      </div>

      <button type="button" onClick={toggleSound} style={styles.soundButton}>
        {soundOn ? 'Turn sound off' : 'Turn sound on'}
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(165deg, var(--zen-surface) 0%, #e8ecf4 50%, var(--zen-surface-elevated) 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
    fontFamily: 'var(--zen-font)',
  },
  glowContainer: {
    marginBottom: '2rem',
  },
  circle: {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 4s ease-in-out, background-color 4s ease-in-out',
    boxShadow: 'var(--zen-shadow)',
  },
  breathText: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--zen-primary)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--zen-primary)',
    marginBottom: '1rem',
  },
  quote: {
    fontStyle: 'italic',
    color: 'var(--zen-text-muted)',
    fontSize: '1.1rem',
    maxWidth: '500px',
    lineHeight: 1.5,
  },
  infoBox: {
    marginTop: '1rem',
    fontSize: '1rem',
    color: 'var(--zen-text)',
  },
  soundButton: {
    marginTop: '1.5rem',
    padding: '0.75rem 1.25rem',
    fontSize: '1rem',
    backgroundColor: 'var(--zen-accent)',
    color: 'var(--zen-primary)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'var(--zen-font)',
    transition: 'background 0.2s ease',
  },
};

export default ZenMode;
