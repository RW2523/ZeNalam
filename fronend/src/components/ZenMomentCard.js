import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../apiClient';
import './styles/ZenMomentCard.css';

const FALLBACK_QUOTE =
  'Stillness is not the absence of movement but the presence of awareness.';

function greetingForHour(h) {
  if (h < 5) return 'Still up?';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

/** Stable “daily” index from server quotes using local calendar date. */
function pickDailyQuote(quotes) {
  if (!quotes?.length) return null;
  const d = new Date();
  const dayKey = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
  const item = quotes[dayKey % quotes.length];
  const text = item?.text || item?.quoteText;
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

/** Visit streak: one increment per calendar day when opening Calm Studio. */
function touchZenStreak() {
  try {
    const today = new Date().toDateString();
    const last = localStorage.getItem('zen_last_visit');
    const prev = parseInt(localStorage.getItem('zen_streak') || '0', 10) || 0;
    if (last === today) return prev;

    const y = new Date();
    y.setDate(y.getDate() - 1);
    const continued = last === y.toDateString();
    const next = continued ? prev + 1 : 1;
    localStorage.setItem('zen_streak', String(next));
    localStorage.setItem('zen_last_visit', today);
    return next;
  } catch {
    return 1;
  }
}

function firstNameFromStorage() {
  try {
    const raw = localStorage.getItem('userName');
    if (!raw || !raw.trim()) return '';
    return raw.trim().split(/\s+/)[0];
  } catch {
    return '';
  }
}

export default function ZenMomentCard() {
  const [quote, setQuote] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [streak, setStreak] = useState(1);
  const [entered, setEntered] = useState(false);

  const hour = new Date().getHours();
  const greeting = greetingForHour(hour);
  const name = useMemo(() => firstNameFromStorage(), []);

  useEffect(() => {
    setStreak(touchZenStreak());
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/api/content/quotes');
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setQuote(pickDailyQuote(list));
        setLoadError(false);
      } catch {
        if (!cancelled) {
          setQuote(null);
          setLoadError(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const line = quote || (loadError ? FALLBACK_QUOTE : null);

  return (
    <div
      className={`zen-moment ${entered ? 'zen-moment--entered' : ''}`}
      aria-live="polite"
    >
      <div className="zen-moment__aurora" aria-hidden="true">
        <span className="zen-moment__blob zen-moment__blob--a" />
        <span className="zen-moment__blob zen-moment__blob--b" />
        <span className="zen-moment__blob zen-moment__blob--c" />
      </div>
      <div className="zen-moment__glass">
        <p className="zen-moment__eyebrow">Today&apos;s calm</p>
        <h2 className="zen-moment__greeting">
          {greeting}
          {name ? (
            <>
              , <span className="zen-moment__name">{name}</span>
            </>
          ) : null}
        </h2>
        {streak >= 1 && (
          <p className="zen-moment__streak">
            <span className="zen-moment__streak-dot" aria-hidden="true" />
            Day {streak} of your calm streak
          </p>
        )}
        {line ? (
          <blockquote className="zen-moment__quote">&ldquo;{line}&rdquo;</blockquote>
        ) : (
          <p className="zen-moment__loading">Gathering today&apos;s words…</p>
        )}
      </div>
    </div>
  );
}
