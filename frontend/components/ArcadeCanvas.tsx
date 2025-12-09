import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Ball, Vector2, Particle } from '../types';

interface ArcadeCanvasProps {
  onScoreUpdate: (points: number, isCombo: boolean) => void;
  onGameOver: () => void;
  gameActive: boolean;
  timeLeft: number;
}

// Physics Constants
const GRAVITY = 0.5;
const FRICTION = 0.99; // Air resistance
const BOUNCE_FACTOR = 0.6;
const DRAG_POWER_SCALE = 0.13;
const MAX_DRAG_DISTANCE = 150;
const FLOOR_HEIGHT_OFFSET = 50;

const ArcadeCanvas: React.FC<ArcadeCanvasProps> = ({ 
  onScoreUpdate, 
  onGameOver, 
  gameActive,
  timeLeft 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // -- Game State Refs --
  
  // Multiple active balls currently in the air
  const activeBallsRef = useRef<Ball[]>([]);
  
  // The single ball ready to be thrown
  const readyBallRef = useRef<Ball | null>(null);
  
  const hoopRef = useRef({
    x: 0,
    y: 150,
    width: 100,
    rimHeight: 10,
    direction: 1, // 1 = right, -1 = left
    speed: 0
  });

  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>();
  
  const comboRef = useRef<number>(0);
  const lastScoreTimeRef = useRef<number>(0);
  const ballIdCounterRef = useRef<number>(0);

  // Helper to create a new ball
  const createBall = (x: number, y: number, id: number): Ball => ({
    id,
    pos: { x, y },
    vel: { x: 0, y: 0 },
    radius: 18,
    isDragging: false,
    dragStart: null,
    dragCurrent: null,
    active: false,
    scored: false,
    createdAt: Date.now()
  });

  // Reset / Spawn logic
  const spawnReadyBall = (canvasWidth: number, canvasHeight: number) => {
    ballIdCounterRef.current += 1;
    readyBallRef.current = createBall(
      canvasWidth / 2, 
      canvasHeight - 150, // Moved up from 100 to 150 for better drag experience
      ballIdCounterRef.current
    );
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color,
        size: Math.random() * 4 + 2
      });
    }
  };

  const updatePhysics = (width: number, height: number) => {
    const hoop = hoopRef.current;
    const now = Date.now();

    // 1. Move Hoop
    // Start moving after 1 minute has passed (Total 180s, so at <= 120s left)
    if (gameActive && timeLeft <= 120) {
      hoop.speed = 2.5;
      hoop.x += hoop.speed * hoop.direction;
      if (hoop.x > width - hoop.width - 20 || hoop.x < 20) {
        hoop.direction *= -1;
      }
    } else {
        // Center the hoop if not moving or if paused
        if (!gameActive) {
            // Do not reset position on pause, just stop updating
        } else {
             const targetX = (width - hoop.width) / 2;
             hoop.x = targetX;
        }
    }

    // 2. Update Active Balls
    // Filter out old balls to clean up memory/processing
    activeBallsRef.current = activeBallsRef.current.filter(b => {
      // Remove if too old (4s) or fallen way below screen
      const age = now - b.createdAt;
      const fellOff = b.pos.y > height + 200;
      return age < 4000 && !fellOff;
    });

    activeBallsRef.current.forEach(ball => {
      // Apply forces
      ball.vel.y += GRAVITY;
      ball.vel.x *= FRICTION;
      ball.vel.y *= FRICTION;

      // Update position
      ball.pos.x += ball.vel.x;
      ball.pos.y += ball.vel.y;

      // Floor Collision
      if (ball.pos.y > height - ball.radius - FLOOR_HEIGHT_OFFSET) {
        ball.pos.y = height - ball.radius - FLOOR_HEIGHT_OFFSET;
        ball.vel.y *= -BOUNCE_FACTOR;
        // If ball is on floor, let it roll
      }

      // Walls
      if (ball.pos.x < ball.radius) {
        ball.pos.x = ball.radius;
        ball.vel.x *= -BOUNCE_FACTOR;
      }
      if (ball.pos.x > width - ball.radius) {
        ball.pos.x = width - ball.radius;
        ball.vel.x *= -BOUNCE_FACTOR;
      }

      // Hoop Collision Logic
      const rimLeftX = hoop.x;
      const rimRightX = hoop.x + hoop.width;
      const rimY = hoop.y;

      // Left Rim
      const dxL = ball.pos.x - rimLeftX;
      const dyL = ball.pos.y - rimY;
      if (Math.sqrt(dxL*dxL + dyL*dyL) < ball.radius + 5) {
         ball.vel.x *= -0.8;
         ball.vel.y *= -0.8;
         const angle = Math.atan2(dyL, dxL);
         ball.pos.x = rimLeftX + Math.cos(angle) * (ball.radius + 6);
         ball.pos.y = rimY + Math.sin(angle) * (ball.radius + 6);
      }
      
      // Right Rim
      const dxR = ball.pos.x - rimRightX;
      const dyR = ball.pos.y - rimY;
      if (Math.sqrt(dxR*dxR + dyR*dyR) < ball.radius + 5) {
         ball.vel.x *= -0.8;
         ball.vel.y *= -0.8;
         const angle = Math.atan2(dyR, dxR);
         ball.pos.x = rimRightX + Math.cos(angle) * (ball.radius + 6);
         ball.pos.y = rimY + Math.sin(angle) * (ball.radius + 6);
      }
      
      // SCORING
      if (!ball.scored && ball.vel.y > 0) {
        if (ball.pos.y > rimY && ball.pos.y < rimY + 20) {
          if (ball.pos.x > rimLeftX + 10 && ball.pos.x < rimRightX - 10) {
            // SCORE!
            ball.scored = true;
            
            // Combo Logic
            if (now - lastScoreTimeRef.current < 2500) {
                comboRef.current += 1;
            } else {
                comboRef.current = 1;
            }
            lastScoreTimeRef.current = now;

            // Calculate Points: Unlimited combo scaling
            const isSwish = Math.abs(ball.pos.x - (hoop.x + hoop.width/2)) < 15;
            let points = 2;
            if (isSwish) points += 1;
            
            // Accumulate faster: Uncapped bonus
            // Example: Combo 10 -> +9 bonus points per shot
            const bonus = Math.max(0, comboRef.current - 1); 
            points += bonus;

            onScoreUpdate(points, comboRef.current > 1);

            // Visuals
            createExplosion(ball.pos.x, ball.pos.y, '#fbbf24'); // Amber
          }
        }
      }
    });
    
    // 3. Update Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
      }
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    const hoop = hoopRef.current;
    
    // Draw Floor
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, height - FLOOR_HEIGHT_OFFSET, width, FLOOR_HEIGHT_OFFSET);
    
    // Draw "Ball Rack" chute visual at bottom center
    ctx.beginPath();
    ctx.moveTo(width/2 - 40, height);
    ctx.lineTo(width/2 - 30, height - FLOOR_HEIGHT_OFFSET);
    ctx.lineTo(width/2 + 30, height - FLOOR_HEIGHT_OFFSET);
    ctx.lineTo(width/2 + 40, height);
    ctx.fillStyle = '#334155';
    ctx.fill();

    // Draw Backboard (Pole)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(width/2 - 5, hoop.y, 10, height - hoop.y - FLOOR_HEIGHT_OFFSET);

    // Draw Backboard (Board)
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.fillRect(hoop.x + hoop.width/2 - 40, hoop.y - 80, 80, 80);
    ctx.strokeRect(hoop.x + hoop.width/2 - 25, hoop.y - 65, 50, 50);

    // Draw Net (Behind rim)
    ctx.beginPath();
    ctx.moveTo(hoop.x, hoop.y);
    ctx.lineTo(hoop.x + 20, hoop.y + 60);
    ctx.lineTo(hoop.x + hoop.width - 20, hoop.y + 60);
    ctx.lineTo(hoop.x + hoop.width, hoop.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Rim
    ctx.beginPath();
    ctx.moveTo(hoop.x, hoop.y);
    ctx.lineTo(hoop.x + hoop.width, hoop.y);
    ctx.strokeStyle = '#f97316'; // Orange-500
    ctx.lineWidth = 5;
    ctx.stroke();

    const drawBall = (b: Ball, isReady: boolean) => {
       // Draw Drag Line
        if (b.isDragging && b.dragStart && b.dragCurrent) {
            const dx = b.dragStart.x - b.dragCurrent.x;
            const dy = b.dragStart.y - b.dragCurrent.y;
            ctx.beginPath();
            ctx.moveTo(b.pos.x, b.pos.y);
            ctx.lineTo(b.pos.x + dx, b.pos.y + dy);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#d97706'; // Amber-600
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Simple shine
        ctx.beginPath();
        ctx.arc(b.pos.x - 5, b.pos.y - 5, 5, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fill();
    }

    // Draw Active Balls
    activeBallsRef.current.forEach(b => drawBall(b, false));

    // Draw Ready Ball (on top)
    if (readyBallRef.current) {
        drawBall(readyBallRef.current, true);
    }

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
  };

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Only update physics if game is active
    if (gameActive) {
        updatePhysics(canvas.width, canvas.height);
    }
    // Always draw so we can see the "frozen" state when paused
    draw(ctx, canvas.width, canvas.height);

    if (gameActive) {
      requestRef.current = requestAnimationFrame(loop);
    }
  }, [gameActive, timeLeft]);

  // Touch/Mouse Handlers
  const handleStart = (clientX: number, clientY: number) => {
    if (!gameActive || !readyBallRef.current) return;
    const ball = readyBallRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const dist = Math.sqrt(Math.pow(x - ball.pos.x, 2) + Math.pow(y - ball.pos.y, 2));
    if (dist < ball.radius * 3) {
      ball.isDragging = true;
      ball.dragStart = { x, y };
      ball.dragCurrent = { x, y };
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!readyBallRef.current || !readyBallRef.current.isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    readyBallRef.current.dragCurrent = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleEnd = () => {
    const ball = readyBallRef.current;
    if (!ball || !ball.isDragging || !ball.dragStart || !ball.dragCurrent) {
        if (ball) {
            // Reset if just clicked without dragging
            ball.isDragging = false;
            ball.dragStart = null;
            ball.dragCurrent = null;
        }
        return;
    }

    const dx = ball.dragStart.x - ball.dragCurrent.x;
    const dy = ball.dragStart.y - ball.dragCurrent.y;

    // Clamp power
    const rawMag = Math.sqrt(dx*dx + dy*dy);
    const mag = Math.min(rawMag, MAX_DRAG_DISTANCE);
    
    // Threshold to actually throw
    if (mag > 20) {
        const scale = mag / rawMag; 
        ball.vel.x = dx * scale * DRAG_POWER_SCALE * 1.5;
        ball.vel.y = dy * scale * DRAG_POWER_SCALE * 1.8; 
        ball.active = true;
        ball.isDragging = false;
        ball.dragStart = null;
        ball.dragCurrent = null;
        ball.createdAt = Date.now(); // Reset creation time to throw time for cleanup logic

        // Move to active balls
        activeBallsRef.current.push(ball);

        // IMMEDIATE SPAWN of next ball
        if (canvasRef.current) {
            spawnReadyBall(canvasRef.current.width, canvasRef.current.height);
        }
    } else {
        // Cancel throw
        ball.isDragging = false;
        ball.dragStart = null;
        ball.dragCurrent = null;
    }
  };

  // Event Listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault(); 
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [gameActive]);

  // Resize & Init Handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        
        // Only spawn a ball if one doesn't exist (init)
        if (!readyBallRef.current) {
           spawnReadyBall(canvasRef.current.width, canvasRef.current.height);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    // Call once to init
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Remove dependency on gameActive so we don't reset balls on pause

  // Loop Controller
  useEffect(() => {
    if (gameActive) {
      requestRef.current = requestAnimationFrame(loop);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameActive, loop]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-900">
        <canvas ref={canvasRef} className="block w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default ArcadeCanvas;