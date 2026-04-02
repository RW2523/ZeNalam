import React, { useEffect } from "react";

/** Deep slate gradient + stars (white + soft gold) — matches ZeNalam theme */
const BG_TOP = "#243352";
const BG_MID = "#1a2744";
const BG_BOTTOM = "#0f1624";

const StarBackground = () => {
  useEffect(() => {
    const canvas = document.getElementById("global-bg-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let gradient = null;
    const rebuildGradient = () => {
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, BG_TOP);
      g.addColorStop(0.45, BG_MID);
      g.addColorStop(1, BG_BOTTOM);
      gradient = g;
    };
    rebuildGradient();

    const stars = [];
    const numStars = 140;

    for (let i = 0; i < numStars; i++) {
      const gold = Math.random() < 0.22;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.35 + 0.35,
        alpha: Math.random() * 0.5 + 0.25,
        dx: (Math.random() - 0.5) * 0.28,
        dy: (Math.random() - 0.5) * 0.28,
        gold,
      });
    }

    function animate() {
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        if (star.gold) {
          ctx.fillStyle = `rgba(201, 162, 39, ${star.alpha * 0.95})`;
        } else {
          ctx.fillStyle = `rgba(232, 238, 247, ${star.alpha})`;
        }
        ctx.fill();

        star.x += star.dx;
        star.y += star.dy;

        if (star.x < 0 || star.x > width) star.dx *= -1;
        if (star.y < 0 || star.y > height) star.dy *= -1;

        star.alpha += (Math.random() - 0.5) * 0.018;
        star.alpha = Math.max(0.15, Math.min(0.95, star.alpha));
      }
      requestAnimationFrame(animate);
    }

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      rebuildGradient();
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      id="global-bg-canvas"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "100vw",
        height: "100vh",
        backgroundColor: BG_BOTTOM,
        pointerEvents: "none",
      }}
    />
  );
};

export default StarBackground;
