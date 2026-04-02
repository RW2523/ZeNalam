import React, { useCallback, useEffect, useRef, useState } from 'react';
import PeaceGameShell from './PeaceGameShell';
import {
  stopPeaceGameMusic,
  startFlowCalmPad,
  setFlowPadEnergy,
} from './peaceGameMusic';

const MAX_POINTS = 900;
const FADE_SPEED = 0.004;

export default function PeaceFlowRiver() {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const drawingRef = useRef(false);
  const rafRef = useRef(null);
  const lastRef = useRef({ x: 0, y: 0, t: 0 });
  const [musicOn, setMusicOn] = useState(false);
  const [strokes, setStrokes] = useState(0);

  const stopMusic = useCallback(() => {
    setMusicOn(false);
    setFlowPadEnergy(0);
    stopPeaceGameMusic().catch(() => {});
  }, []);

  const toggleMusic = useCallback(async () => {
    if (musicOn) {
      stopMusic();
      return;
    }
    try {
      await startFlowCalmPad();
      setMusicOn(true);
    } catch {
      setMusicOn(false);
    }
  }, [musicOn, stopMusic]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stopPeaceGameMusic().catch(() => {});
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      const g = ctx2d.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#0f1624');
      g.addColorStop(0.5, '#152238');
      g.addColorStop(1, '#0a0e18');
      ctx2d.fillStyle = g;
      ctx2d.fillRect(0, 0, w, h);

      const pts = pointsRef.current;
      for (let i = 0; i < pts.length; i++) {
        pts[i].life -= FADE_SPEED;
      }
      pointsRef.current = pts.filter((p) => p.life > 0);

      if (pointsRef.current.length > 1) {
        ctx2d.lineCap = 'round';
        ctx2d.lineJoin = 'round';
        for (let i = 1; i < pointsRef.current.length; i++) {
          const a = pointsRef.current[i - 1];
          const b = pointsRef.current[i];
          const alpha = Math.min(0.85, a.life * 0.9);
          ctx2d.strokeStyle = `rgba(201, 162, 39, ${alpha * 0.45})`;
          ctx2d.lineWidth = 2 + a.life * 5;
          ctx2d.beginPath();
          ctx2d.moveTo(a.x, a.y);
          ctx2d.lineTo(b.x, b.y);
          ctx2d.stroke();

          ctx2d.strokeStyle = `rgba(232, 238, 247, ${alpha * 0.22})`;
          ctx2d.lineWidth = 1 + a.life * 2;
          ctx2d.beginPath();
          ctx2d.moveTo(a.x, a.y);
          ctx2d.lineTo(b.x, b.y);
          ctx2d.stroke();
        }
      }

      for (const p of pointsRef.current) {
        const alpha = p.life * 0.5;
        const grd = ctx2d.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
        grd.addColorStop(0, `rgba(255, 250, 235, ${alpha * 0.35})`);
        grd.addColorStop(1, 'rgba(201, 162, 39, 0)');
        ctx2d.fillStyle = grd;
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, 12 * p.life + 2, 0, Math.PI * 2);
        ctx2d.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const addPoint = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const t = performance.now();
    const last = lastRef.current;
    const dist = Math.hypot(x - last.x, y - last.y);
    const dt = t - last.t;
    const speed = dt > 0 ? dist / dt : 0;
    lastRef.current = { x, y, t };

    pointsRef.current.push({ x, y, life: 1 });
    if (pointsRef.current.length > MAX_POINTS) {
      pointsRef.current.shift();
    }

    if (musicOn) {
      setFlowPadEnergy(Math.min(1, speed * 0.35 + 0.15));
    }
  }, [musicOn]);

  const onPointerDown = (e) => {
    drawingRef.current = true;
    addPoint(e.clientX, e.clientY);
    setStrokes((s) => s + 1);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!drawingRef.current) return;
    addPoint(e.clientX, e.clientY);
  };

  const endDraw = useCallback(() => {
    drawingRef.current = false;
    if (musicOn) {
      setFlowPadEnergy(0.2);
      window.setTimeout(() => setFlowPadEnergy(0), 400);
    }
  }, [musicOn]);

  const clearFlow = () => {
    pointsRef.current = [];
  };

  return (
    <PeaceGameShell
      title="Flow river"
      hint="Click and drag to paint rivers of light. They fade like breath. With music, the pad brightens as you move—then softens when you rest."
    >
      <div className="peace-game-toolbar">
        <button
          type="button"
          className={`peace-game-toolbtn${musicOn ? ' peace-game-toolbtn--on' : ''}`}
          onClick={toggleMusic}
        >
          {musicOn ? 'Music on' : 'Music off'}
        </button>
        <button type="button" className="peace-game-toolbtn" onClick={clearFlow}>
          Clear canvas
        </button>
        <span className="peace-game-stat" aria-live="polite">
          Strokes: {strokes}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="peace-canvas peace-canvas--flow"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDraw}
        onPointerCancel={endDraw}
        onPointerLeave={endDraw}
        role="img"
        aria-label="Flow river — drag to paint light"
      />
    </PeaceGameShell>
  );
}
