import React, { useMemo, useState } from 'react';
import PeaceGameShell from './PeaceGameShell';

export default function PeaceHarmony() {
  const [hue, setHue] = useState(215);
  const [soft, setSoft] = useState(42);

  const bg = useMemo(() => {
    const h = hue;
    const s = 28 + soft * 0.15;
    const l = 18 + soft * 0.12;
    const h2 = (hue + 18) % 360;
    return `linear-gradient(160deg, hsl(${h}, ${s}%, ${l}%) 0%, hsl(${h2}, ${Math.min(s + 8, 55)}%, ${Math.max(l - 6, 10)}%) 100%)`;
  }, [hue, soft]);

  return (
    <PeaceGameShell
      title="Calm palette"
      hint="There is no right answer—only what feels steady to you right now."
    >
      <div className="peace-harmony">
        <div
          className="peace-harmony__canvas"
          style={{ background: bg }}
          aria-hidden="true"
        />
        <div className="peace-harmony__controls">
          <label className="peace-harmony__label" htmlFor="peace-hue">
            Mood tone
          </label>
          <input
            id="peace-hue"
            type="range"
            min={180}
            max={280}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="peace-harmony__range"
          />
          <label className="peace-harmony__label" htmlFor="peace-soft">
            Softness
          </label>
          <input
            id="peace-soft"
            type="range"
            min={10}
            max={90}
            value={soft}
            onChange={(e) => setSoft(Number(e.target.value))}
            className="peace-harmony__range"
          />
        </div>
      </div>
    </PeaceGameShell>
  );
}
