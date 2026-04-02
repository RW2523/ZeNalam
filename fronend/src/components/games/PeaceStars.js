import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PeaceGameShell from './PeaceGameShell';

let starId = 0;

function randomStar() {
  return {
    id: starId++,
    top: 6 + Math.random() * 78,
    delay: Math.random() * 8,
    duration: 14 + Math.random() * 12,
    gold: Math.random() < 0.35,
    size: 3 + Math.random() * 4,
  };
}

export default function PeaceStars() {
  const [stars, setStars] = useState(() =>
    Array.from({ length: 10 }, () => randomStar())
  );
  const [gathered, setGathered] = useState(0);

  const replenish = useCallback(() => {
    setStars((prev) => {
      if (prev.length >= 12) return prev;
      return [...prev, randomStar()];
    });
  }, []);

  useEffect(() => {
    const t = window.setInterval(replenish, 3500);
    return () => window.clearInterval(t);
  }, [replenish]);

  const catchStar = useCallback((id) => {
    setStars((prev) => prev.filter((s) => s.id !== id));
    setGathered((g) => g + 1);
  }, []);

  const hint = useMemo(
    () =>
      gathered === 0
        ? 'Tap a drifting light to gather it—or leave them be.'
        : `You’ve gathered ${gathered} gentle light${gathered === 1 ? '' : 's'}.`,
    [gathered]
  );

  return (
    <PeaceGameShell title="Drifting lights" hint={hint}>
      <div className="peace-stars" role="application" aria-label="Drifting stars">
        {stars.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`peace-stars__star${s.gold ? ' peace-stars__star--gold' : ''}`}
            style={{
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
            onClick={() => catchStar(s.id)}
            aria-label="Gather light"
          />
        ))}
      </div>
    </PeaceGameShell>
  );
}
