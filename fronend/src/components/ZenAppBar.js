import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ZEN_SOUND_OPTIONS,
  getZenSoundMode,
  setZenSoundMode,
  applyZenSoundMode,
  stopZenSoundscape,
} from '../zenSoundscape';
import '../styles/zen-app-bar.css';

export default function ZenAppBar() {
  const { pathname } = useLocation();
  const onZenHome = pathname === '/zen';

  const [soundMode, setSoundMode] = useState(() => getZenSoundMode());

  useEffect(() => {
    setSoundMode(getZenSoundMode());
  }, [pathname]);

  const onSoundChange = useCallback(async (e) => {
    const value = e.target.value;
    setSoundMode(value);
    try {
      if (value === 'off') {
        setZenSoundMode('off');
        stopZenSoundscape();
        return;
      }
      await applyZenSoundMode(value);
    } catch {
      setZenSoundMode('off');
      stopZenSoundscape();
      setSoundMode('off');
    }
  }, []);

  return (
    <header className="zen-app-bar">
      <Link to="/dashboard" className="zen-app-bar__link zen-app-bar__link--start">
        ← Dashboard
      </Link>
      <div className="zen-app-bar__mid">
        <span className="zen-app-bar__title">Calm Studio</span>
        <label className="zen-app-bar__sound-label" htmlFor="zen-sound-select">
          <span className="zen-app-bar__sound-label-text">Sound</span>
          <select
            id="zen-sound-select"
            className="zen-app-bar__select"
            value={soundMode}
            onChange={onSoundChange}
            aria-label="Calm Studio background sound"
          >
            {ZEN_SOUND_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <a
            href="/audio/calm/CREDITS.txt"
            className="zen-app-bar__credits"
            target="_blank"
            rel="noopener noreferrer"
          >
            Audio credits
          </a>
        </label>
      </div>
      <div className="zen-app-bar__end">
        {onZenHome ? (
          <span className="zen-app-bar__link zen-app-bar__link--placeholder" aria-hidden="true">
            Zen home
          </span>
        ) : (
          <Link to="/zen" className="zen-app-bar__link">
            Zen home
          </Link>
        )}
      </div>
    </header>
  );
}
