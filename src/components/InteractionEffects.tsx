import { useRef, useEffect, useCallback, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  type: 'circle' | 'ring' | 'droplet' | 'star' | 'bone' | 'heart';
  gravity: number;
}

interface EffectRequest {
  id: number;
  type: 'spray_water' | 'ring_bell' | 'throw_fish' | 'toss_treat' | 'drop_toy';
}

export function useInteractionEffects() {
  const [effects, setEffects] = useState<EffectRequest[]>([]);

  const triggerEffect = useCallback((type: EffectRequest['type']) => {
    const id = Date.now() + Math.random();
    setEffects(prev => [...prev, { id, type }]);
    setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== id));
    }, 3500);
  }, []);

  return { effects, triggerEffect };
}

interface Props {
  effects: EffectRequest[];
}

export function InteractionEffectsCanvas({ effects }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const activeRef = useRef(false);
  const bellRingsRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; alpha: number }[]>([]);

  const spawnWaterSpray = useCallback((w: number, h: number) => {
    const originX = w * 0.5;
    const originY = h * 0.3;
    const particles: Particle[] = [];

    for (let i = 0; i < 80; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const speed = 2 + Math.random() * 6;
      const life = 40 + Math.random() * 40;
      particles.push({
        x: originX + (Math.random() - 0.5) * 30,
        y: originY,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.3 ? '#67e8f9' : '#a5f3fc',
        alpha: 0.7 + Math.random() * 0.3,
        rotation: 0,
        rotationSpeed: 0,
        type: 'droplet',
        gravity: 0.08 + Math.random() * 0.04,
      });
    }

    for (let i = 0; i < 20; i++) {
      const delay = Math.random() * 15;
      const life = 25 + Math.random() * 20;
      particles.push({
        x: originX + (Math.random() - 0.5) * 80,
        y: originY + Math.random() * 40,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -0.5 - Math.random() * 1.5,
        life: life + delay,
        maxLife: life + delay,
        size: 1 + Math.random() * 2,
        color: '#cffafe',
        alpha: 0.3 + Math.random() * 0.3,
        rotation: 0,
        rotationSpeed: 0,
        type: 'circle',
        gravity: 0.02,
      });
    }

    return particles;
  }, []);

  const spawnBellRing = useCallback((w: number, h: number) => {
    const cx = w * 0.5;
    const cy = h * 0.5;

    bellRingsRef.current.push(
      { x: cx, y: cy, radius: 10, maxRadius: Math.min(w, h) * 0.5, alpha: 0.6 },
      { x: cx, y: cy, radius: 5, maxRadius: Math.min(w, h) * 0.4, alpha: 0.4 },
      { x: cx, y: cy, radius: 3, maxRadius: Math.min(w, h) * 0.3, alpha: 0.3 },
    );

    const particles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      const life = 30 + Math.random() * 30;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#fbbf24' : '#fde68a',
        alpha: 0.8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        type: 'star',
        gravity: -0.01,
      });
    }
    return particles;
  }, []);

  const spawnFishSplash = useCallback((w: number, h: number) => {
    const cx = w * 0.5;
    const cy = h * 0.55;
    const particles: Particle[] = [];

    for (let i = 0; i < 50; i++) {
      const angle = -Math.PI + Math.random() * Math.PI;
      const speed = 3 + Math.random() * 5;
      const life = 35 + Math.random() * 35;
      particles.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle)) * speed,
        life,
        maxLife: life,
        size: 2 + Math.random() * 5,
        color: Math.random() > 0.4 ? '#60a5fa' : '#93c5fd',
        alpha: 0.8,
        rotation: 0,
        rotationSpeed: 0,
        type: 'droplet',
        gravity: 0.12,
      });
    }

    for (let i = 0; i < 8; i++) {
      const life = 50 + Math.random() * 30;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      particles.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life,
        maxLife: life,
        size: 8 + Math.random() * 6,
        color: '#3b82f6',
        alpha: 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        type: 'circle',
        gravity: 0.02,
      });
    }

    return particles;
  }, []);

  const spawnTreatBounce = useCallback((w: number, h: number) => {
    const cx = w * 0.5;
    const particles: Particle[] = [];

    for (let i = 0; i < 25; i++) {
      const startX = cx + (Math.random() - 0.5) * 100;
      const life = 50 + Math.random() * 40;
      particles.push({
        x: startX,
        y: 0,
        vx: (Math.random() - 0.5) * 3,
        vy: 3 + Math.random() * 4,
        life,
        maxLife: life,
        size: 5 + Math.random() * 6,
        color: Math.random() > 0.5 ? '#fbbf24' : '#f59e0b',
        alpha: 0.9,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        type: 'bone',
        gravity: 0.1,
      });
    }

    for (let i = 0; i < 40; i++) {
      const life = 20 + Math.random() * 30;
      particles.push({
        x: cx + (Math.random() - 0.5) * 150,
        y: h * 0.7 + Math.random() * 40,
        vx: (Math.random() - 0.5) * 4,
        vy: -2 - Math.random() * 4,
        life,
        maxLife: life,
        size: 2 + Math.random() * 3,
        color: '#fde68a',
        alpha: 0.7,
        rotation: 0,
        rotationSpeed: 0,
        type: 'star',
        gravity: 0.05,
      });
    }

    return particles;
  }, []);

  const spawnToyDrop = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];

    for (let i = 0; i < 15; i++) {
      const life = 60 + Math.random() * 30;
      const startX = w * 0.2 + Math.random() * w * 0.6;
      particles.push({
        x: startX,
        y: -10,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 3,
        life,
        maxLife: life,
        size: 10 + Math.random() * 8,
        color: ['#ec4899', '#f472b6', '#fb923c', '#a78bfa', '#34d399'][Math.floor(Math.random() * 5)],
        alpha: 0.85,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        type: 'heart',
        gravity: 0.06,
      });
    }

    for (let i = 0; i < 50; i++) {
      const life = 25 + Math.random() * 25;
      particles.push({
        x: w * 0.3 + Math.random() * w * 0.4,
        y: h * 0.6 + Math.random() * 60,
        vx: (Math.random() - 0.5) * 5,
        vy: -3 - Math.random() * 4,
        life,
        maxLife: life,
        size: 2 + Math.random() * 3,
        color: ['#ec4899', '#fbbf24', '#34d399', '#60a5fa'][Math.floor(Math.random() * 4)],
        alpha: 0.8,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        type: 'star',
        gravity: 0.06,
      });
    }

    return particles;
  }, []);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, p: Particle) => {
    ctx.save();
    ctx.globalAlpha = p.alpha * (p.life / p.maxLife);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    if (p.type === 'droplet') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.3, p.size * 0.5, p.size * 0.5, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.5, -p.size * 0.7, -p.size * 0.3, 0, -p.size);
      ctx.fill();
    } else if (p.type === 'star') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        if (i === 0) ctx.moveTo(Math.cos(outerAngle) * p.size, Math.sin(outerAngle) * p.size);
        else ctx.lineTo(Math.cos(outerAngle) * p.size, Math.sin(outerAngle) * p.size);
        ctx.lineTo(Math.cos(innerAngle) * p.size * 0.4, Math.sin(innerAngle) * p.size * 0.4);
      }
      ctx.closePath();
      ctx.fill();
    } else if (p.type === 'bone') {
      ctx.fillStyle = p.color;
      const s = p.size;
      ctx.beginPath();
      ctx.ellipse(-s * 0.6, -s * 0.3, s * 0.35, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-s * 0.6, s * 0.3, s * 0.35, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s * 0.6, -s * 0.3, s * 0.35, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s * 0.6, s * 0.3, s * 0.35, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-s * 0.5, -s * 0.2, s, s * 0.4);
    } else if (p.type === 'heart') {
      ctx.fillStyle = p.color;
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s * 0.5, -s * 0.1, -s, -s * 0.5, -s * 0.5, -s * 0.7);
      ctx.bezierCurveTo(-s * 0.2, -s * 0.9, 0, -s * 0.6, 0, -s * 0.3);
      ctx.bezierCurveTo(0, -s * 0.6, s * 0.2, -s * 0.9, s * 0.5, -s * 0.7);
      ctx.bezierCurveTo(s, -s * 0.5, s * 0.5, -s * 0.1, 0, s * 0.3);
      ctx.fill();
    } else if (p.type === 'ring') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bellRingsRef.current = bellRingsRef.current.filter(ring => {
      ring.radius += 4;
      ring.alpha -= 0.012;
      if (ring.alpha <= 0) return false;

      ctx.save();
      ctx.globalAlpha = ring.alpha;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return true;
    });

    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;
      p.life--;

      if (p.life <= 0) return false;
      drawParticle(ctx, p);
      return true;
    });

    if (particlesRef.current.length > 0 || bellRingsRef.current.length > 0) {
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      activeRef.current = false;
    }
  }, [drawParticle]);

  const startAnimation = useCallback(() => {
    if (!activeRef.current) {
      activeRef.current = true;
      animFrameRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (effects.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    const w = canvas.width;
    const h = canvas.height;

    const latest = effects[effects.length - 1];
    let newParticles: Particle[] = [];

    switch (latest.type) {
      case 'spray_water':
        newParticles = spawnWaterSpray(w, h);
        break;
      case 'ring_bell':
        newParticles = spawnBellRing(w, h);
        break;
      case 'throw_fish':
        newParticles = spawnFishSplash(w, h);
        break;
      case 'toss_treat':
        newParticles = spawnTreatBounce(w, h);
        break;
      case 'drop_toy':
        newParticles = spawnToyDrop(w, h);
        break;
    }

    particlesRef.current.push(...newParticles);
    startAnimation();
  }, [effects, spawnWaterSpray, spawnBellRing, spawnFishSplash, spawnTreatBounce, spawnToyDrop, startAnimation]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
