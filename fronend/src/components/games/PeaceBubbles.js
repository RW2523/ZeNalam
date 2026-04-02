import React, { useCallback, useEffect, useRef, useState } from 'react';
import PeaceGameShell from './PeaceGameShell';

let bubbleId = 0;

export default function PeaceBubbles() {
  const [bubbles, setBubbles] = useState([]);
  const timerRef = useRef(null);

  const spawn = useCallback(() => {
    setBubbles((prev) => {
      if (prev.length >= 14) return prev;
      const id = bubbleId++;
      const left = 8 + Math.random() * 84;
      const size = 28 + Math.random() * 36;
      const duration = 9 + Math.random() * 7;
      return [...prev, { id, left, size, duration }];
    });
  }, []);

  useEffect(() => {
    spawn();
    timerRef.current = window.setInterval(spawn, 2200);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [spawn]);

  const pop = useCallback((id) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <PeaceGameShell
      title="Soft bubbles"
      hint="Bubbles rise on their own. Tap one to softly release it."
    >
      <div
        className="peace-bubbles"
        role="application"
        aria-label="Bubble field"
      >
        {bubbles.map((b) => (
          <button
            key={b.id}
            type="button"
            className="peace-bubbles__bubble"
            style={{
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.duration}s`,
            }}
            onClick={() => pop(b.id)}
            aria-label="Release bubble"
          />
        ))}
      </div>
    </PeaceGameShell>
  );
}
