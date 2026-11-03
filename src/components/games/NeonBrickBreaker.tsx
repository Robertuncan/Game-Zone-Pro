import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Shield } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface NeonBrickBreakerProps {
  onGameOver?: (score: number) => void;
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  points: number;
  alive: boolean;
}

export const NeonBrickBreaker: React.FC<NeonBrickBreakerProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'>('START');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isMuted, setIsMuted] = useState(false);

  const stateRef = useRef({
    paddle: { x: 350, y: 460, w: 100, h: 14, speed: 480 },
    ball: { x: 400, y: 440, vx: 240, vy: -280, r: 8, inPlay: false },
    bricks: [] as Brick[],
    keys: { left: false, right: false },
    score: 0,
    lives: 3
  });

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const initBricks = (): Brick[] => {
    const list: Brick[] = [];
    const rows = 5;
    const cols = 9;
    const bw = 74;
    const bh = 22;
    const startX = 55;
    const startY = 60;
    const colors = ['#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({
          x: startX + c * (bw + 8),
          y: startY + r * (bh + 8),
          w: bw,
          h: bh,
          color: colors[r],
          points: (rows - r) * 20,
          alive: true
        });
      }
    }
    return list;
  };

  const handleStartGame = () => {
    stateRef.current = {
      paddle: { x: 350, y: 460, w: 100, h: 14, speed: 480 },
      ball: { x: 400, y: 440, vx: 240, vy: -280, r: 8, inPlay: true },
      bricks: initBricks(),
      keys: { left: false, right: false },
      score: 0,
      lives: 3
    };
    setScore(0);
    setLives(3);
    setGameState('PLAYING');
    soundManager.playScore();
  };

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) stateRef.current.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) stateRef.current.keys.right = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) stateRef.current.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) stateRef.current.keys.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const st = stateRef.current;
      const W = canvas.width;
      const H = canvas.height;

      // Move paddle
      if (st.keys.left) st.paddle.x -= st.paddle.speed * dt;
      if (st.keys.right) st.paddle.x += st.paddle.speed * dt;
      st.paddle.x = Math.max(10, Math.min(W - st.paddle.w - 10, st.paddle.x));

      // Move Ball
      st.ball.x += st.ball.vx * dt;
      st.ball.y += st.ball.vy * dt;

      // Ball Wall Collisions
      if (st.ball.x - st.ball.r < 0) {
        st.ball.x = st.ball.r;
        st.ball.vx = -st.ball.vx;
        soundManager.playClick();
      }
      if (st.ball.x + st.ball.r > W) {
        st.ball.x = W - st.ball.r;
        st.ball.vx = -st.ball.vx;
        soundManager.playClick();
      }
      if (st.ball.y - st.ball.r < 0) {
        st.ball.y = st.ball.r;
        st.ball.vy = -st.ball.vy;
        soundManager.playClick();
      }

      // Ball Paddle Collision
      if (
        st.ball.vy > 0 &&
        st.ball.y + st.ball.r >= st.paddle.y &&
        st.ball.y - st.ball.r <= st.paddle.y + st.paddle.h &&
        st.ball.x >= st.paddle.x - 6 &&
        st.ball.x <= st.paddle.x + st.paddle.w + 6
      ) {
        st.ball.vy = -Math.abs(st.ball.vy);
        // Angle variance depending on where on paddle it hit
        const hitOffset = (st.ball.x - (st.paddle.x + st.paddle.w / 2)) / (st.paddle.w / 2);
        st.ball.vx = hitOffset * 320;
        soundManager.playLaser();
      }

      // Ball Brick Collision
      let remainingBricks = 0;
      st.bricks.forEach(b => {
        if (!b.alive) return;
        remainingBricks++;
        if (
          st.ball.x + st.ball.r > b.x &&
          st.ball.x - st.ball.r < b.x + b.w &&
          st.ball.y + st.ball.r > b.y &&
          st.ball.y - st.ball.r < b.y + b.h
        ) {
          b.alive = false;
          st.ball.vy = -st.ball.vy;
          st.score += b.points;
          setScore(st.score);
          soundManager.playCoin();
        }
      });

      // Check Victory
      if (remainingBricks === 0) {
        setGameState('VICTORY');
        soundManager.playVictory();
        if (onGameOver) onGameOver(st.score + 1000);
        return;
      }

      // Ball fell out bottom
      if (st.ball.y > H + 20) {
        st.lives -= 1;
        setLives(st.lives);
        soundManager.playGameOver();
        if (st.lives <= 0) {
          setGameState('GAMEOVER');
          if (onGameOver) onGameOver(st.score);
          return;
        } else {
          // Reset ball onto paddle
          st.ball.x = st.paddle.x + st.paddle.w / 2;
          st.ball.y = st.paddle.y - 12;
          st.ball.vx = 220;
          st.ball.vy = -260;
        }
      }

      // --- DRAW CANVAS ---
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, W, H);

      // Draw Bricks
      st.bricks.forEach(b => {
        if (!b.alive) return;
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, 3);
        ctx.restore();
      });

      // Draw Paddle
      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 12;
      ctx.fillRect(st.paddle.x, st.paddle.y, st.paddle.w, st.paddle.h);
      ctx.restore();

      // Draw Ball
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(st.ball.x, st.ball.y, st.ball.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, onGameOver]);

  return (
    <div className="relative w-full aspect-[16/10] max-h-[700px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center select-none shadow-2xl">
      {/* HUD Header */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Score:</span>
            <span className="font-mono text-cyan-300 font-bold tabular-nums text-sm">{score}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Lives:</span>
            <span className="font-mono text-emerald-400 font-bold">{lives}</span>
          </div>
        </div>

        <button
          onClick={toggleMute}
          className="p-2 text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        onMouseMove={(e) => {
          if (gameState === 'PLAYING') {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * 800;
            stateRef.current.paddle.x = mouseX - stateRef.current.paddle.w / 2;
          }
        }}
        className="w-full h-full object-cover cursor-none"
      />

      {/* START MODAL */}
      {gameState === 'START' && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight mb-2">
            HyperBreak: Cyber Brick Breaker
          </h2>
          <p className="max-w-md text-sm text-slate-400 mb-6">
            Move your energy paddle using your mouse or Left/Right arrows to smash through holographic data bricks!
          </p>
          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Launch Energy Ball
          </button>
        </div>
      )}

      {/* GAMEOVER */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <h3 className="text-2xl font-black text-white font-display tracking-tight">System Purged</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">Your energy paddle lost all reserves.</p>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl max-w-xs w-full mb-6 text-center">
            <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{score} PTS</span>
          </div>
          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-400 hover:to-blue-500 shadow-md transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}

      {/* VICTORY */}
      {gameState === 'VICTORY' && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <Trophy className="w-12 h-12 text-amber-400 mb-2" />
          <h3 className="text-2xl font-black text-white font-display tracking-tight">Grid Cleared!</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">Every single data node shattered with perfection.</p>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl max-w-xs w-full mb-6 text-center">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{score + 1000} PTS</span>
          </div>
          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg hover:from-amber-400 hover:to-yellow-400 shadow-md transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Play Another Round
          </button>
        </div>
      )}
    </div>
  );
};
