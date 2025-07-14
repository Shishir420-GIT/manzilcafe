import { useEffect, useRef } from 'react';

const STAR_COUNT = 80;
const STAR_COLORS = ['#fff', '#ffe9c4', '#d4fbff'];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

const StarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const stars = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Generate stars
    stars.current = Array.from({ length: STAR_COUNT }, () => ({
      x: randomBetween(0, width),
      y: randomBetween(0, height),
      r: randomBetween(0.5, 1.5),
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      speed: randomBetween(0.05, 0.2),
      twinkle: Math.random(),
    }));

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      for (let star of stars.current) {
        // Twinkle
        const twinkle = 0.7 + 0.3 * Math.sin(Date.now() * 0.002 + star.twinkle * 10);
        ctx!.globalAlpha = twinkle;
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
        ctx!.fillStyle = star.color;
        ctx!.fill();
        ctx!.globalAlpha = 1;
        // Move star
        star.y += star.speed;
        if (star.y > height) {
          star.x = randomBetween(0, width);
          star.y = -2;
        }
      }
      animationRef.current = requestAnimationFrame(draw);
    }
    draw();

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'transparent',
      }}
      aria-hidden="true"
    />
  );
};

export default StarryBackground; 