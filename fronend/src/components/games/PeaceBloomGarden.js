import React, { useCallback, useEffect, useRef, useState } from 'react';
import PeaceGameShell from './PeaceGameShell';
import {
  stopPeaceGameMusic,
  startFlowCalmPad,
  playBloomChime,
} from './peaceGameMusic';

const MAX_BLOOMS = 48;
const BLOOM_LIFE_MS = 9000;

export default function PeaceBloomGarden() {
  const canvasRef = useRef(null);
  const bloomsRef = useRef([]);
  const rafRef = useRef(null);
  const [musicOn, setMusicOn] = useState(false);
  const [planted, setPlanted] = useState(0);
  const bloomCountRef = useRef(0);

  const stopMusic = useCallback(() => {
    setMusicOn(false);
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

    const now = () => performance.now();

    const loop = () => {
      const t = now();
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      ctx2d.fillStyle = '#0a0e18';
      ctx2d.fillRect(0, 0, w, h);

      bloomsRef.current = bloomsRef.current.filter((b) => t - b.born < BLOOM_LIFE_MS);

      for (const b of bloomsRef.current) {
        const age = (t - b.born) / BLOOM_LIFE_MS;
        const ease = 1 - (1 - age) ** 1.4;
        const r = 8 + ease * (b.maxR || 120);
        const alpha = (1 - age) * 0.55;
        const grd = ctx2d.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
        grd.addColorStop(0, `hsla(${b.hue}, 70%, 62%, ${alpha * 0.9})`);
        grd.addColorStop(0.35, `hsla(${b.hue + 18}, 55%, 48%, ${alpha * 0.45})`);
        grd.addColorStop(1, `hsla(${b.hue + 40}, 40%, 22%, 0)`);
        ctx2d.fillStyle = grd;
        ctx2d.beginPath();
        ctx2d.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx2d.fill();

        ctx2d.strokeStyle = `rgba(201, 162, 39, ${alpha * 0.35})`;
        ctx2d.lineWidth = 1.5;
        ctx2d.beginPath();
        ctx2d.arc(b.x, b.y, r * 0.92, 0, Math.PI * 2);
        ctx2d.stroke();
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const plant = useCallback(
    (clientX, clientY) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const hue = 200 + Math.random() * 55;
      bloomsRef.current.push({
        x,
        y,
        born: performance.now(),
        hue,
        maxR: 90 + Math.random() * 70,
      });
      if (bloomsRef.current.length > MAX_BLOOMS) {
        bloomsRef.current.shift();
      }
      bloomCountRef.current += 1;
      setPlanted((n) => n + 1);
      if (musicOn) {
        playBloomChime(bloomCountRef.current);
      }
    },
    [musicOn]
  );

  const onPointerDown = (e) => {
    plant(e.clientX, e.clientY);
  };

  const clearGarden = () => {
    bloomsRef.current = [];
  };

  return (
    <PeaceGameShell
      title="Bloom garden"
      hint="Tap or click to grow soft lights. Optional music adds a gentle chime with each bloom."
    >
      <div className="peace-game-toolbar">
        <button
          type="button"
          className={`peace-game-toolbtn${musicOn ? ' peace-game-toolbtn--on' : ''}`}
          onClick={toggleMusic}
        >
          {musicOn ? 'Music on' : 'Music off'}
        </button>
        <button type="button" className="peace-game-toolbtn" onClick={clearGarden}>
          Clear garden
        </button>
        <span className="peace-game-stat" aria-live="polite">
          Blooms: {planted}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="peace-canvas peace-canvas--bloom"
        onPointerDown={onPointerDown}
        role="img"
        aria-label="Bloom garden — tap to plant lights"
      />
    </PeaceGameShell>
  );
}
