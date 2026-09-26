import { useEffect, useRef } from 'react';

interface Bug {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  type: 'ant' | 'beetle' | 'spider' | 'roach';
  size: number;
  turnTimer: number;
  turnInterval: number;
  legPhase: number;
}

const BUG_COUNT = 18;

function drawAnt(ctx: CanvasRenderingContext2D, size: number, legPhase: number) {
  const s = size;
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.fillStyle = 'rgba(20,10,5,0.6)';
  ctx.lineWidth = s * 0.12;
  ctx.lineCap = 'round';

  const legSwing = Math.sin(legPhase) * s * 0.55;

  for (let i = -1; i <= 1; i += 2) {
    for (let j = 0; j < 3; j++) {
      const lx = (j - 1) * s * 0.5;
      const ly = i * s * 0.35;
      ctx.beginPath();
      ctx.moveTo(lx, ly * 0.4);
      ctx.lineTo(lx + i * legSwing * (j === 1 ? 1.2 : 0.8), ly + i * s * 0.15);
      ctx.stroke();
    }
  }

  ctx.beginPath();
  ctx.ellipse(0, -s * 0.7, s * 0.18, s * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, -s * 0.35, s * 0.2, s * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, s * 0.1, s * 0.28, s * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-s * 0.1, -s * 0.78);
  ctx.lineTo(-s * 0.25, -s * 1.1);
  ctx.moveTo(s * 0.1, -s * 0.78);
  ctx.lineTo(s * 0.25, -s * 1.1);
  ctx.stroke();
}

function drawBeetle(ctx: CanvasRenderingContext2D, size: number, legPhase: number) {
  const s = size;
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = s * 0.1;
  ctx.lineCap = 'round';

  const legSwing = Math.sin(legPhase) * s * 0.4;
  for (let i = -1; i <= 1; i += 2) {
    for (let j = 0; j < 3; j++) {
      const lx = (j - 1) * s * 0.4;
      const ly = i * s * 0.4;
      ctx.beginPath();
      ctx.moveTo(lx, ly * 0.3);
      ctx.lineTo(lx + i * legSwing * 0.9, ly + i * s * 0.12);
      ctx.stroke();
    }
  }

  ctx.fillStyle = 'rgba(30,60,20,0.65)';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.05, s * 0.35, s * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(15,15,10,0.6)';
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.45, s * 0.22, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = s * 0.06;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.2);
  ctx.lineTo(0, s * 0.45);
  ctx.stroke();
}

function drawSpider(ctx: CanvasRenderingContext2D, size: number, legPhase: number) {
  const s = size;
  ctx.strokeStyle = 'rgba(10,5,0,0.55)';
  ctx.lineWidth = s * 0.09;
  ctx.lineCap = 'round';

  const swing = Math.sin(legPhase) * s * 0.5;
  for (let i = 0; i < 4; i++) {
    const baseAngle = (i / 4) * Math.PI - Math.PI / 2;
    const legLength = s * 0.9;
    for (let side = -1; side <= 1; side += 2) {
      const a = baseAngle + side * 0.3 + (i % 2 === 0 ? swing * 0.05 : -swing * 0.05);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const mx = Math.cos(a) * legLength * 0.5;
      const my = Math.sin(a) * legLength * 0.5;
      ctx.lineTo(mx, my);
      ctx.lineTo(mx + Math.cos(a + side * 0.6) * legLength * 0.5, my + Math.sin(a + side * 0.6) * legLength * 0.5);
      ctx.stroke();
    }
  }

  ctx.fillStyle = 'rgba(25,15,5,0.65)';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.18, s * 0.22, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(40,25,10,0.6)';
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.18, s * 0.2, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoach(ctx: CanvasRenderingContext2D, size: number, legPhase: number) {
  const s = size;
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = s * 0.1;
  ctx.lineCap = 'round';

  const legSwing = Math.sin(legPhase) * s * 0.45;
  for (let i = -1; i <= 1; i += 2) {
    for (let j = 0; j < 3; j++) {
      const lx = (j - 1.5) * s * 0.35;
      const ly = i * s * 0.35;
      ctx.beginPath();
      ctx.moveTo(lx, ly * 0.3);
      ctx.lineTo(lx + i * legSwing * 0.8, ly + i * s * 0.1);
      ctx.stroke();
    }
  }

  ctx.fillStyle = 'rgba(60,35,10,0.65)';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.08, s * 0.28, s * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(40,22,5,0.6)';
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.42, s * 0.22, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = s * 0.07;
  ctx.beginPath();
  ctx.moveTo(-s * 0.12, -s * 0.52);
  ctx.lineTo(-s * 0.3, -s * 0.9);
  ctx.moveTo(s * 0.12, -s * 0.52);
  ctx.lineTo(s * 0.3, -s * 0.9);
  ctx.stroke();
}

function createBug(id: number, width: number, height: number): Bug {
  const types: Bug['type'][] = ['ant', 'beetle', 'spider', 'roach'];
  return {
    id,
    x: Math.random() * width,
    y: Math.random() * height,
    angle: Math.random() * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.7,
    type: types[Math.floor(Math.random() * types.length)],
    size: 6 + Math.random() * 8,
    turnTimer: 0,
    turnInterval: 60 + Math.random() * 120,
    legPhase: Math.random() * Math.PI * 2,
  };
}

export default function CrawlingBugs() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bugsRef = useRef<Bug[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    bugsRef.current = Array.from({ length: BUG_COUNT }, (_, i) =>
      createBug(i, canvas.width, canvas.height)
    );

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      bugsRef.current.forEach(bug => {
        bug.turnTimer++;
        bug.legPhase += 0.18 * bug.speed;

        if (bug.turnTimer >= bug.turnInterval) {
          bug.angle += (Math.random() - 0.5) * Math.PI * 1.2;
          bug.turnInterval = 60 + Math.random() * 120;
          bug.turnTimer = 0;
        }

        bug.x += Math.cos(bug.angle) * bug.speed;
        bug.y += Math.sin(bug.angle) * bug.speed;

        if (bug.x < -20) bug.x = canvas.width + 10;
        if (bug.x > canvas.width + 20) bug.x = -10;
        if (bug.y < -20) bug.y = canvas.height + 10;
        if (bug.y > canvas.height + 20) bug.y = -10;

        ctx.save();
        ctx.translate(bug.x, bug.y);
        ctx.rotate(bug.angle + Math.PI / 2);

        switch (bug.type) {
          case 'ant': drawAnt(ctx, bug.size, bug.legPhase); break;
          case 'beetle': drawBeetle(ctx, bug.size, bug.legPhase); break;
          case 'spider': drawSpider(ctx, bug.size, bug.legPhase); break;
          case 'roach': drawRoach(ctx, bug.size, bug.legPhase); break;
        }

        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
