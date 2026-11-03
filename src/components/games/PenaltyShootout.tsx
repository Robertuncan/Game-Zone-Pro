import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, CircleDot } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface PenaltyShootoutProps {
  onGameOver?: (score: number) => void;
}

export const PenaltyShootout: React.FC<PenaltyShootoutProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'START' | 'AIMING' | 'KICKING' | 'RESULT' | 'GAMEOVER'>('START');
  const [attempts, setAttempts] = useState(0);
  const [goals, setGoals] = useState(0);
  const [lastResult, setLastResult] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);

  // Ball & Keeper Animation state
  const stateRef = useRef({
    ball: { x: 400, y: 430, z: 0, vx: 0, vy: 0, vz: 0, radius: 18 },
    keeper: { x: 400, y: 220, targetX: 400, isDiving: false },
    aim: { x: 400, y: 210, dir: 1 },
    curve: 0,
    power: 70
  });

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const handleStartGame = () => {
    setAttempts(0);
    setGoals(0);
    setLastResult('');
    setGameState('AIMING');
    stateRef.current.ball = { x: 400, y: 430, z: 0, vx: 0, vy: 0, vz: 0, radius: 18 };
    stateRef.current.keeper = { x: 400, y: 220, targetX: 400, isDiving: false };
    soundManager.playScore();
  };

  const handleKick = (targetX: number, targetY: number) => {
    if (gameState !== 'AIMING') return;

    soundManager.playLaser(); // kicking thud
    setGameState('KICKING');

    // Keeper AI choice (dive left, dive right, stay)
    const keeperChoices = [280, 340, 400, 460, 520];
    const chosenKeeperX = keeperChoices[Math.floor(Math.random() * keeperChoices.length)];

    const st = stateRef.current;
    st.keeper.targetX = chosenKeeperX;
    st.keeper.isDiving = true;

    // Ball physics trajectory
    const dx = targetX - st.ball.x;
    const dy = targetY - st.ball.y;
    st.ball.vx = dx * 1.8;
    st.ball.vy = dy * 1.8;
    st.ball.vz = 2.0;

    // Check goal after 0.8s
    setTimeout(() => {
      const isSaved = Math.abs(chosenKeeperX - targetX) < 48;
      const isOutOfBounds = targetX < 240 || targetX > 560 || targetY < 150 || targetY > 270;

      let resultText = '';
      if (isOutOfBounds) {
        resultText = 'MISS! Over the crossbar!';
        soundManager.playGameOver();
      } else if (isSaved) {
        resultText = 'SAVED! Keeper makes a heroic block!';
        soundManager.playGameOver();
      } else {
        resultText = 'GOAL! Top corner precision strike!';
        soundManager.playVictory();
        setGoals(prev => prev + 1);
      }

      setLastResult(resultText);
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        setGameState('GAMEOVER');
        if (onGameOver) {
          onGameOver((goals + (isSaved || isOutOfBounds ? 0 : 1)) * 1000);
        }
      } else {
        setGameState('RESULT');
      }
    }, 850);
  };

  const nextAttempt = () => {
    stateRef.current.ball = { x: 400, y: 430, z: 0, vx: 0, vy: 0, vz: 0, radius: 18 };
    stateRef.current.keeper = { x: 400, y: 220, targetX: 400, isDiving: false };
    setLastResult('');
    setGameState('AIMING');
  };

  // Canvas Render Loop
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

      // Update Aiming reticle sway
      if (gameState === 'AIMING') {
        st.aim.x += st.aim.dir * 220 * dt;
        if (st.aim.x > 530) st.aim.dir = -1;
        if (st.aim.x < 270) st.aim.dir = 1;
      }

      // Update Kicking Ball & Keeper
      if (gameState === 'KICKING') {
        st.ball.x += st.ball.vx * dt;
        st.ball.y += st.ball.vy * dt;
        st.ball.radius = Math.max(8, st.ball.radius - 12 * dt);

        // Move keeper towards target
        st.keeper.x += (st.keeper.targetX - st.keeper.x) * 6 * dt;
      }

      // --- DRAW GRAPHICS ---
      ctx.clearRect(0, 0, W, H);

      // Stadium stands background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 180);
      skyGrad.addColorStop(0, '#022c22');
      skyGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, 180);

      // Cheering crowd dots
      for (let i = 0; i < 90; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(56, 189, 248, 0.25)';
        ctx.fillRect((i * 19) % W, 20 + ((i * 13) % 100), 4, 4);
      }

      // Stadium floodlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(80, 20, 18, 12);
      ctx.fillRect(W - 98, 20, 18, 12);

      // Green Pitch Grass with perspective stripes
      const grassGrad = ctx.createLinearGradient(0, 180, 0, H);
      grassGrad.addColorStop(0, '#15803d');
      grassGrad.addColorStop(1, '#166534');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, 180, W, H - 180);

      // Alternating Pitch Lawn Mower Stripes
      for (let s = 0; s < 6; s++) {
        const sy1 = 180 + s * 55;
        ctx.fillStyle = s % 2 === 0 ? 'rgba(22, 101, 52, 0.4)' : 'rgba(21, 128, 61, 0.4)';
        ctx.fillRect(0, sy1, W, 55);
      }

      // Penalty Box lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Outer 18yd box
      ctx.strokeRect(180, 180, W - 360, 180);
      // Penalty spot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(400, 430, 5, 0, Math.PI * 2);
      ctx.fill();

      // Goal Post frame & Net
      const goalX1 = 230;
      const goalX2 = 570;
      const crossbarY = 150;
      const groundY = 270;

      // Net pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let nx = goalX1; nx <= goalX2; nx += 16) {
        ctx.beginPath();
        ctx.moveTo(nx, crossbarY);
        ctx.lineTo(nx + (nx < 400 ? -20 : 20), groundY);
        ctx.stroke();
      }
      for (let ny = crossbarY; ny <= groundY; ny += 14) {
        ctx.beginPath();
        ctx.moveTo(goalX1, ny);
        ctx.lineTo(goalX2, ny);
        ctx.stroke();
      }

      // Goal Posts (White metallic cylinders)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(goalX1, groundY);
      ctx.lineTo(goalX1, crossbarY);
      ctx.lineTo(goalX2, crossbarY);
      ctx.lineTo(goalX2, groundY);
      ctx.stroke();

      // Goalkeeper
      ctx.save();
      const kx = st.keeper.x;
      const ky = st.keeper.y;

      // Keeper shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(kx, groundY - 4, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Keeper Body (Neon orange jersey)
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(kx - 12, ky - 30, 24, 34);

      // Keeper Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(kx, ky - 38, 9, 0, Math.PI * 2);
      ctx.fill();

      // Keeper Arms / Gloves (Neon Yellow)
      ctx.fillStyle = '#fde047';
      if (st.keeper.isDiving) {
        ctx.fillRect(kx - 26, ky - 34, 12, 10);
        ctx.fillRect(kx + 14, ky - 34, 12, 10);
      } else {
        ctx.fillRect(kx - 22, ky - 20, 10, 10);
        ctx.fillRect(kx + 12, ky - 20, 10, 10);
      }
      ctx.restore();

      // Aiming Reticle (when aiming)
      if (gameState === 'AIMING') {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(st.aim.x, st.aim.y, 16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(st.aim.x - 22, st.aim.y);
        ctx.lineTo(st.aim.x + 22, st.aim.y);
        ctx.moveTo(st.aim.x, st.aim.y - 22);
        ctx.lineTo(st.aim.x, st.aim.y + 22);
        ctx.stroke();
        ctx.restore();
      }

      // Soccer Ball
      ctx.save();
      const bx = st.ball.x;
      const by = st.ball.y;
      const br = st.ball.radius;

      // Ball shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(bx, by + br * 0.8, br * 0.9, br * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ball sphere
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();

      // Classic Black Pentagon patches on soccer ball
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(bx, by, br * 0.38, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bx - br * 0.5, by - br * 0.4, br * 0.22, 0, Math.PI * 2);
      ctx.arc(bx + br * 0.5, by - br * 0.4, br * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  return (
    <div className="relative w-full aspect-[16/10] max-h-[700px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center select-none shadow-2xl">
      {/* Stadium Header HUD */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Goals:</span>
            <span className="font-mono text-emerald-400 font-bold tabular-nums text-sm">{goals} / {attempts}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <CircleDot className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Attempts Left:</span>
            <span className="font-mono text-cyan-300 font-bold">{Math.max(0, 5 - attempts)}</span>
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
        onClick={(e) => {
          if (gameState === 'AIMING') {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = ((e.clientX - rect.left) / rect.width) * 800;
            const clickY = ((e.clientY - rect.top) / rect.height) * 500;
            handleKick(clickX, clickY);
          }
        }}
        className="w-full h-full object-cover cursor-crosshair"
      />

      {/* START MODAL */}
      {gameState === 'START' && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CircleDot className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            World Cup Penalty Striker Pro
          </h2>
          <p className="max-w-md text-sm text-slate-400 mt-2 mb-6">
            Take 5 championship penalty kicks. Click inside the goal frame to choose your target spot and beat the diving keeper.
          </p>

          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Step Up to the Spot
          </button>
        </div>
      )}

      {/* RESULT MODAL (Between Kicks) */}
      {gameState === 'RESULT' && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <h3 className="text-2xl font-bold text-white font-display mb-2">{lastResult}</h3>
          <p className="text-xs text-slate-400 mb-6">Attempt {attempts} of 5 completed.</p>
          <button
            onClick={nextAttempt}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-all shadow-md active:scale-95"
          >
            Take Next Kick
          </button>
        </div>
      )}

      {/* GAME OVER */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <Trophy className="w-12 h-12 text-amber-400 mb-3" />
          <h3 className="text-2xl font-black text-white font-display tracking-tight">Shootout Finished</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">{lastResult}</p>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl max-w-xs w-full mb-6 text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Penalty Score</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{goals} / 5 Goals</span>
          </div>

          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg hover:from-emerald-400 hover:to-teal-500 shadow-md transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Play Another Match
          </button>
        </div>
      )}

      {/* AIM GUIDE PROMPT */}
      {gameState === 'AIMING' && (
        <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center pointer-events-none">
          <div className="px-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-medium shadow-lg backdrop-blur-sm">
            ⚽ Click or Tap inside the goal to shoot!
          </div>
        </div>
      )}
    </div>
  );
};
