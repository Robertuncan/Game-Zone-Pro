import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Clock, Dribbble } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface BasketballShooterProps {
  onGameOver?: (score: number) => void;
}

export const BasketballShooter: React.FC<BasketballShooterProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isMuted, setIsMuted] = useState(false);

  const stateRef = useRef({
    ball: { x: 400, y: 420, vx: 0, vy: 0, inFlight: false, scored: false, r: 18 },
    hoop: { x: 400, y: 160, rimW: 64, backboardH: 80 },
    aimAngle: -Math.PI / 2.3,
    power: 75,
    powerDir: 1,
    streak: 0,
    score: 0
  });

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const handleStartGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setGameState('PLAYING');
    stateRef.current.ball = { x: 400, y: 420, vx: 0, vy: 0, inFlight: false, scored: false, r: 18 };
    stateRef.current.score = 0;
    stateRef.current.streak = 0;
    soundManager.playScore();
  };

  const shootBall = () => {
    const st = stateRef.current;
    if (st.ball.inFlight || gameState !== 'PLAYING') return;

    soundManager.playLaser(); // shot release sound
    st.ball.inFlight = true;
    st.ball.scored = false;

    // Shot physics vector based on angle & power
    const shootPower = 680 + (st.power * 2.8);
    st.ball.vx = Math.cos(st.aimAngle) * shootPower * 0.45;
    st.ball.vy = Math.sin(st.aimAngle) * shootPower;
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('GAMEOVER');
          soundManager.playGameOver();
          if (onGameOver) onGameOver(stateRef.current.score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, onGameOver]);

  // Main Canvas Loop
  useEffect(() => {
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

      // Update Power Meter Oscillation when aiming
      if (!st.ball.inFlight && gameState === 'PLAYING') {
        st.power += st.powerDir * 120 * dt;
        if (st.power > 95) st.powerDir = -1;
        if (st.power < 50) st.powerDir = 1;
      }

      // Update Ball Flight
      if (st.ball.inFlight) {
        st.ball.vy += 850 * dt; // Gravity
        st.ball.x += st.ball.vx * dt;
        st.ball.y += st.ball.vy * dt;

        // Check Hoop Collision (Hoop center: 400, 160)
        const hoopX = st.hoop.x;
        const hoopY = st.hoop.y;
        const rimHalf = st.hoop.rimW / 2;

        // Backboard Bounce (Backboard at x = 400 + rimHalf, y = 110 to 190)
        if (st.ball.x > hoopX + rimHalf - 4 && st.ball.x < hoopX + rimHalf + 16 && st.ball.y > 100 && st.ball.y < 190) {
          st.ball.vx = -st.ball.vx * 0.65;
          soundManager.playClick();
        }

        // Swish check inside rim
        if (!st.ball.scored && st.ball.vy > 0 && Math.abs(st.ball.x - hoopX) < 22 && Math.abs(st.ball.y - hoopY) < 14) {
          st.ball.scored = true;
          soundManager.playVictory();
          st.streak += 1;
          const points = 3 + (st.streak > 2 ? (st.streak - 1) * 2 : 0);
          st.score += points;
          setScore(st.score);
          setStreak(st.streak);
        }

        // Ball falls below screen or misses
        if (st.ball.y > H + 40 || st.ball.x < -40 || st.ball.x > W + 40) {
          if (!st.ball.scored) {
            st.streak = 0;
            setStreak(0);
          }
          // Reset ball to player hands
          st.ball = { x: 400, y: 420, vx: 0, vy: 0, inFlight: false, scored: false, r: 18 };
        }
      }

      // --- RENDER COURT ---
      ctx.clearRect(0, 0, W, H);

      // Urban sunset skyline
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
      skyGrad.addColorStop(0, '#1e1b4b');
      skyGrad.addColorStop(0.7, '#431407');
      skyGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.6);

      // Distant city fences & street court floodlights
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, H * 0.55, W, H * 0.05);

      // Hardwood / Asphalt Basketball court
      const courtGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
      courtGrad.addColorStop(0, '#b45309');
      courtGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = courtGrad;
      ctx.fillRect(0, H * 0.6, W, H * 0.4);

      // Key paint & 3-point arc
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(400, 160, 260, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      // Draw Basketball Hoop Structure
      const hx = st.hoop.x;
      const hy = st.hoop.y;

      // Pole & Backboard Support
      ctx.fillStyle = '#334155';
      ctx.fillRect(hx + 30, hy - 60, 12, 180);

      // Backboard Glass
      ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 4;
      ctx.strokeRect(hx - 6, hy - 60, 36, 68);
      ctx.fillRect(hx - 6, hy - 60, 36, 68);

      // Orange Inner Box on Backboard
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(hx, hy - 32, 22, 24);

      // Rim (Orange iron ring)
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(hx, hy, st.hoop.rimW / 2, 8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Net (White cross-hatched cords)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      const netH = 34;
      for (let n = -26; n <= 26; n += 9) {
        ctx.beginPath();
        ctx.moveTo(hx + n, hy + 4);
        ctx.lineTo(hx + n * 0.6, hy + netH);
        ctx.stroke();
      }

      // Ball Trajectory Guide (dotted curve when aiming)
      if (!st.ball.inFlight && gameState === 'PLAYING') {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(st.ball.x, st.ball.y);
        ctx.quadraticCurveTo(400, 100 - st.power * 0.4, hx, hy);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Basketball
      const bx = st.ball.x;
      const by = st.ball.y;
      const br = st.ball.r;

      ctx.save();
      // Shadow under ball on court
      if (!st.ball.inFlight) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.ellipse(bx, by + br + 2, br * 0.8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Basketball surface
      ctx.fillStyle = '#ea580c';
      ctx.shadowColor = '#c2410c';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();

      // Basketball black seams
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx - br, by);
      ctx.lineTo(bx + br, by);
      ctx.moveTo(bx, by - br);
      ctx.lineTo(bx, by + br);
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  return (
    <div className="relative w-full aspect-[16/10] max-h-[700px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center select-none shadow-2xl">
      {/* HUD Header */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Score:</span>
            <span className="font-mono text-amber-300 font-bold tabular-nums text-sm">{score}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Time:</span>
            <span className="font-mono text-cyan-300 font-bold tabular-nums">{timeLeft}s</span>
          </div>

          {streak > 1 && (
            <div className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 rounded-lg text-orange-400 font-bold text-xs flex items-center gap-1 animate-pulse">
              🔥 {streak}X Streak!
            </div>
          )}
        </div>

        <button
          onClick={toggleMute}
          className="p-2 text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-cover" />

      {/* START MODAL */}
      {gameState === 'START' && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-4 text-orange-400 shadow-lg shadow-orange-500/20">
            <Dribbble className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Urban Streetball: 3-Point Clutch
          </h2>
          <p className="max-w-md text-sm text-slate-400 mt-2 mb-6">
            Step behind the arc. Release the shot when the power meter aligns with the sweet spot to drain 3-pointers before the 60-second buzzer sounds.
          </p>

          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl hover:from-orange-400 hover:to-amber-500 shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Shoot Around
          </button>
        </div>
      )}

      {/* GAME OVER */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <Trophy className="w-12 h-12 text-amber-400 mb-3" />
          <h3 className="text-2xl font-black text-white font-display tracking-tight">Final Buzzer!</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">Your 60-second clutch contest has concluded.</p>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl max-w-xs w-full mb-6 text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Total Points</span>
            <span className="text-2xl font-bold font-mono text-orange-400 tabular-nums">{score} PTS</span>
          </div>

          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg hover:from-orange-400 hover:to-amber-500 shadow-md transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Shoot Again
          </button>
        </div>
      )}

      {/* SHOOT CTA BUTTON */}
      {gameState === 'PLAYING' && (
        <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center">
          <button
            onClick={shootBall}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Dribbble className="w-4 h-4" /> RELEASE SHOT (SPACE)
          </button>
        </div>
      )}
    </div>
  );
};
