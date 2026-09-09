import { useEffect, useRef } from "react";

// Lightweight canvas spark/firefly particle overlay for dark sections
export const SparkParticles = ({ density = 40, color = "234,179,8" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let particles = [];
    let w, h;

    const resize = () => {
      const parent = canvas.parentElement;
      w = canvas.width = parent.offsetWidth;
      h = canvas.height = parent.offsetHeight;
    };
    resize();

    const make = () =>
      Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        vy: -(Math.random() * 0.5 + 0.15),
        vx: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * 0.02 + 0.005,
      }));
    particles = make();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        p.a += p.tw;
        if (p.a > 0.85 || p.a < 0.15) p.tw *= -1;
        if (p.y < -5) {
          p.y = h + 5;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.a})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${color},0.9)`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [density, color]);

  return <canvas ref={canvasRef} className="spark-canvas" aria-hidden="true" />;
};
