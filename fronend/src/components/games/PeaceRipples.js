import React, { useCallback, useRef, useState } from 'react';
import PeaceGameShell from './PeaceGameShell';

let rippleId = 0;

export default function PeaceRipples() {
  const wrapRef = useRef(null);
  const [ripples, setRipples] = useState([]);

  const onPointerDown = useCallback((e) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const id = rippleId++;
    setRipples((prev) => [...prev, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((p) => p.id !== id));
    }, 1400);
  }, []);

  return (
    <PeaceGameShell
      title="Quiet ripples"
      hint="Press or tap the dark area. As often or as rarely as you want."
    >
      <div
        ref={wrapRef}
        className="peace-ripples"
        onPointerDown={onPointerDown}
        role="application"
        aria-label="Ripple pond — tap to create ripples"
      >
        {ripples.map((p) => (
          <span
            key={p.id}
            className="peace-ripples__ring"
            style={{ left: p.x, top: p.y }}
          />
        ))}
      </div>
    </PeaceGameShell>
  );
}
