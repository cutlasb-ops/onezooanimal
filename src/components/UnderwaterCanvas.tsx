import { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
}

interface Fish {
  x: number;
  y: number;
  size: number;
  speed: number;
  dir: number;
  color: string;
  tailPhase: number;
  tailSpeed: number;
  yWobble: number;
  yWobbleSpeed: number;
}

interface Jellyfish {
  x: number;
  y: number;
  size: number;
  speed: number;
  pulse: number;
  pulseSpeed: number;
  color: string;
  drift: number;
  driftSpeed: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
}

const FISH_COLORS = [
  '#fbbf24', '#f59e0b', '#d97706',
  '#34d399', '#60a5fa', '#fb923c',
  '#fcd34d', '#a3e635',
];

const JELLY_COLORS = [
  'rgba(251,191,36,0.4)', 'rgba(52,211,153,0.35)',
  'rgba(96,165,250,0.35)', 'rgba(248,113,113,0.3)',
];

function createBubbles(w: number, h: number, count: number): Bubble[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: h + Math.random() * h * 0.5,
    r: 2 + Math.random() * 6,
    speed: 0.3 + Math.random() * 0.8,
    wobble: 0,
    wobbleSpeed: 0.02 + Math.random() * 0.03,
    opacity: 0.15 + Math.random() * 0.35,
  }));
}

function createFish(w: number, h: number, count: number): Fish[] {
  return Array.from({ length: count }, () => {
    const dir = Math.random() > 0.5 ? 1 : -1;
    return {
      x: dir === 1 ? -60 - Math.random() * w * 0.5 : w + 60 + Math.random() * w * 0.5,
      y: h * 0.15 + Math.random() * h * 0.7,
      size: 12 + Math.random() * 20,
      speed: 0.4 + Math.random() * 0.8,
      dir,
      color: FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)],
      tailPhase: Math.random() * Math.PI * 2,
      tailSpeed: 0.08 + Math.random() * 0.06,
      yWobble: 0,
      yWobbleSpeed: 0.01 + Math.random() * 0.015,
    };
  });
}

function createJellyfish(w: number, h: number, count: number): Jellyfish[] {
  return Array.from({ length: count }, () => ({
    x: w * 0.1 + Math.random() * w * 0.8,
    y: h + 40 + Math.random() * h * 0.3,
    size: 14 + Math.random() * 22,
    speed: 0.15 + Math.random() * 0.3,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.03 + Math.random() * 0.02,
    color: JELLY_COLORS[Math.floor(Math.random() * JELLY_COLORS.length)],
    drift: 0,
    driftSpeed: 0.005 + Math.random() * 0.01,
  }));
}

function createParticles(w: number, h: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: 1 + Math.random() * 2,
    speed: 0.05 + Math.random() * 0.15,
    opacity: 0.1 + Math.random() * 0.25,
    drift: Math.random() * Math.PI * 2,
  }));
}

function drawFish(ctx: CanvasRenderingContext2D, f: Fish, globalAlpha: number) {
  ctx.save();
  ctx.globalAlpha = globalAlpha * 0.85;
  ctx.translate(f.x, f.y);
  ctx.scale(f.dir, 1);

  const tailSwing = Math.sin(f.tailPhase) * 4;

  ctx.beginPath();
  ctx.moveTo(f.size, 0);
  ctx.quadraticCurveTo(f.size * 0.6, -f.size * 0.45, 0, -f.size * 0.15);
  ctx.quadraticCurveTo(-f.size * 0.3, -f.size * 0.1, -f.size * 0.5, -f.size * 0.35 + tailSwing);
  ctx.lineTo(-f.size * 0.35, 0);
  ctx.lineTo(-f.size * 0.5, f.size * 0.35 + tailSwing);
  ctx.quadraticCurveTo(-f.size * 0.3, f.size * 0.1, 0, f.size * 0.15);
  ctx.quadraticCurveTo(f.size * 0.6, f.size * 0.45, f.size, 0);
  ctx.closePath();

  ctx.fillStyle = f.color;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(f.size * 0.55, -f.size * 0.08, f.size * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(f.size * 0.56, -f.size * 0.09, f.size * 0.03, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  ctx.restore();
}

function drawJellyfish(ctx: CanvasRenderingContext2D, j: Jellyfish, globalAlpha: number) {
  ctx.save();
  ctx.globalAlpha = globalAlpha * 0.7;
  ctx.translate(j.x, j.y);

  const pulseScale = 1 + Math.sin(j.pulse) * 0.12;

  ctx.beginPath();
  ctx.ellipse(0, 0, j.size * pulseScale, j.size * 0.65 * pulseScale, 0, Math.PI, 0);
  ctx.fillStyle = j.color;
  ctx.fill();

  const tentacles = 5;
  for (let t = 0; t < tentacles; t++) {
    const tx = -j.size * 0.6 + (t / (tentacles - 1)) * j.size * 1.2;
    const wave = Math.sin(j.pulse * 1.5 + t * 0.8) * 4;
    ctx.beginPath();
    ctx.moveTo(tx * pulseScale, 0);
    ctx.quadraticCurveTo(
      (tx + wave) * pulseScale,
      j.size * 0.5,
      (tx + wave * 1.5) * pulseScale,
      j.size * 0.9 + Math.sin(j.pulse + t) * 3
    );
    ctx.strokeStyle = j.color;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  ctx.restore();
}

interface Props {
  scrollProgress: number;
}

export function UnderwaterCanvas({ scrollProgress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    bubbles: Bubble[];
    fish: Fish[];
    jellyfish: Jellyfish[];
    particles: Particle[];
    initialized: boolean;
  }>({ bubbles: [], fish: [], jellyfish: [], particles: [], initialized: false });
  const rafRef = useRef<number>(0);
  const progressRef = useRef(0);

  progressRef.current = scrollProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;
      stateRef.current = {
        bubbles: createBubbles(w, h, 40),
        fish: createFish(w, h, 12),
        jellyfish: createJellyfish(w, h, 5),
        particles: createParticles(w, h, 60),
        initialized: true,
      };
    }

    function animate() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const p = progressRef.current;

      ctx.clearRect(0, 0, w, h);

      const intensity = Math.min(1, p * 2.5);
      const { bubbles, fish, jellyfish, particles } = stateRef.current;

      particles.forEach((pt) => {
        pt.drift += 0.01;
        pt.x += Math.sin(pt.drift) * 0.3;
        pt.y -= pt.speed * intensity;
        if (pt.y < -10) {
          pt.y = h + 10;
          pt.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${pt.opacity * intensity * 0.5})`;
        ctx.fill();
      });

      bubbles.forEach((b) => {
        b.wobble += b.wobbleSpeed;
        b.y -= b.speed * (0.3 + intensity * 1.2);
        b.x += Math.sin(b.wobble) * 0.6;

        if (b.y < -20) {
          b.y = h + 10 + Math.random() * 40;
          b.x = Math.random() * w;
        }

        const alpha = b.opacity * intensity;
        if (alpha < 0.01) return;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);

        const grad = ctx.createRadialGradient(
          b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1,
          b.x, b.y, b.r
        );
        grad.addColorStop(0, `rgba(186,230,253,${alpha * 0.6})`);
        grad.addColorStop(0.7, `rgba(96,165,250,${alpha * 0.3})`);
        grad.addColorStop(1, `rgba(96,165,250,0)`);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.35})`;
        ctx.fill();
      });

      const fishAlpha = Math.max(0, (intensity - 0.15) / 0.85);
      fish.forEach((f) => {
        f.tailPhase += f.tailSpeed;
        f.yWobble += f.yWobbleSpeed;
        f.x += f.speed * f.dir * (0.5 + fishAlpha * 1.2);
        f.y += Math.sin(f.yWobble) * 0.5;

        if (f.dir === 1 && f.x > w + 80) {
          f.x = -60 - Math.random() * 100;
          f.y = h * 0.15 + Math.random() * h * 0.7;
        } else if (f.dir === -1 && f.x < -80) {
          f.x = w + 60 + Math.random() * 100;
          f.y = h * 0.15 + Math.random() * h * 0.7;
        }

        if (fishAlpha > 0.01) {
          drawFish(ctx, f, fishAlpha);
        }
      });

      const jellyAlpha = Math.max(0, (intensity - 0.3) / 0.7);
      jellyfish.forEach((j) => {
        j.pulse += j.pulseSpeed;
        j.drift += j.driftSpeed;
        j.y -= j.speed * (0.3 + jellyAlpha * 0.8);
        j.x += Math.sin(j.drift) * 0.4;

        if (j.y < -60) {
          j.y = h + 40 + Math.random() * 60;
          j.x = w * 0.1 + Math.random() * w * 0.8;
        }

        if (jellyAlpha > 0.01) {
          drawJellyfish(ctx, j, jellyAlpha);
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 15 }}
    />
  );
}
