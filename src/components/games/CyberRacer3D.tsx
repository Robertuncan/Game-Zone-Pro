import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Maximize, Trophy, Zap } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface CyberRacer3DProps {
  onGameOver?: (score: number) => void;
}

export const CyberRacer3D: React.FC<CyberRacer3DProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(120);
  const [nitro, setNitro] = useState(100);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gamezone_hiscore_racer') || '0', 10);
  });
  const [isMuted, setIsMuted] = useState(false);

  // Game internal state ref
  const stateRef = useRef({
    playerX: 0, // -1 to 1
    targetX: 0,
    speed: 120, // km/h
    distance: 0,
    nitro: 100,
    isNitroActive: false,
    traffic: [] as { x: number; z: number; speed: number; color: string; width: number }[],
    orbs: [] as { x: number; z: number; collected: boolean }[],
    roadOffset: 0,
    curve: 0,
    targetCurve: 0,
    keys: { left: false, right: false, boost: false }
  });

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const handleStartGame = () => {
    stateRef.current = {
      playerX: 0,
      targetX: 0,
      speed: 120,
      distance: 0,
      nitro: 100,
      isNitroActive: false,
      traffic: [
        { x: -0.4, z: 800, speed: 60, color: '#ef4444', width: 0.22 },
        { x: 0.3, z: 1400, speed: 70, color: '#3b82f6', width: 0.22 },
        { x: 0, z: 2000, speed: 50, color: '#eab308', width: 0.22 }
      ],
      orbs: [
        { x: -0.3, z: 500, collected: false },
        { x: 0.4, z: 1100, collected: false },
        { x: 0, z: 1700, collected: false }
      ],
      roadOffset: 0,
      curve: 0,
      targetCurve: 0,
      keys: { left: false, right: false, boost: false }
    };
    setScore(0);
    setGameState('PLAYING');
    soundManager.playEngineAccelerate();
  };

  const handlePause = () => {
    if (gameState === 'PLAYING') setGameState('PAUSED');
    else if (gameState === 'PAUSED') setGameState('PLAYING');
  };

  const triggerGameOver = useCallback((finalScore: number) => {
    setGameState('GAMEOVER');
    soundManager.playGameOver();
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('gamezone_hiscore_racer', finalScore.toString());
    }
    if (onGameOver) {
      onGameOver(finalScore);
    }
  }, [highScore, onGameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        stateRef.current.keys.left = true;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        stateRef.current.keys.right = true;
      }
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        stateRef.current.keys.boost = true;
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        handlePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        stateRef.current.keys.left = false;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        stateRef.current.keys.right = false;
      }
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        stateRef.current.keys.boost = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Main game rendering loop
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

      // Handle Inputs
      if (st.keys.left) st.playerX -= 1.8 * dt;
      if (st.keys.right) st.playerX += 1.8 * dt;
      st.playerX = Math.max(-0.85, Math.min(0.85, st.playerX));

      // Nitro & Speed
      const isBoosting = st.keys.boost && st.nitro > 5;
      st.isNitroActive = isBoosting;

      const baseSpeed = 140 + Math.min(st.distance / 150, 100);
      const targetSpeed = isBoosting ? baseSpeed + 90 : baseSpeed;
      st.speed += (targetSpeed - st.speed) * 4 * dt;

      if (isBoosting) {
        st.nitro = Math.max(0, st.nitro - 28 * dt);
      } else {
        st.nitro = Math.min(100, st.nitro + 8 * dt);
      }

      // Distance & Score
      st.distance += (st.speed * dt);
      const currentScore = Math.floor(st.distance / 10);
      setScore(currentScore);
      setSpeed(Math.floor(st.speed));
      setNitro(Math.floor(st.nitro));

      // Road Curve transitions
      if (Math.random() < 0.01) {
        st.targetCurve = (Math.random() - 0.5) * 1.5;
      }
      st.curve += (st.targetCurve - st.curve) * 0.8 * dt;

      // Move Road Lines
      st.roadOffset += (st.speed * dt * 0.08);
      if (st.roadOffset > 1) st.roadOffset %= 1;

      // Update Traffic
      for (let i = 0; i < st.traffic.length; i++) {
        const car = st.traffic[i];
        car.z -= (st.speed - car.speed) * dt * 10;

        // Collision Check with Player (Player is at z = 100)
        if (car.z < 160 && car.z > 60) {
          const dx = Math.abs(car.x - st.playerX);
          if (dx < 0.22) {
            soundManager.playExplosion();
            triggerGameOver(currentScore);
            return;
          }
        }

        // Recycle passed traffic
        if (car.z < 20) {
          car.z = 1800 + Math.random() * 800;
          car.x = (Math.random() - 0.5) * 1.4;
          car.speed = 50 + Math.random() * 50;
        }
      }

      // Update Nitro Orbs
      for (let i = 0; i < st.orbs.length; i++) {
        const orb = st.orbs[i];
        orb.z -= st.speed * dt * 10;

        if (!orb.collected && orb.z < 150 && orb.z > 60) {
          const dx = Math.abs(orb.x - st.playerX);
          if (dx < 0.25) {
            orb.collected = true;
            st.nitro = Math.min(100, st.nitro + 35);
            soundManager.playCoin();
          }
        }

        if (orb.z < 20) {
          orb.z = 1600 + Math.random() * 1000;
          orb.x = (Math.random() - 0.5) * 1.4;
          orb.collected = false;
        }
      }

      // --- RENDERING CANVAS ---
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Sky gradient (Tokyo midnight cyberpunk)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
      skyGrad.addColorStop(0, '#050711');
      skyGrad.addColorStop(0.7, '#0f172a');
      skyGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.5);

      // Distant Neon Tokyo Skyline silhouettes
      ctx.fillStyle = '#090d1a';
      for (let i = 0; i < 24; i++) {
        const bx = i * (W / 20) - (st.curve * 30);
        const bw = W / 22;
        const bh = 50 + ((i * 37) % 70);
        ctx.fillRect(bx, H * 0.5 - bh, bw, bh);
        // glowing window dots
        ctx.fillStyle = (i % 2 === 0) ? 'rgba(56, 189, 248, 0.4)' : 'rgba(168, 85, 247, 0.4)';
        ctx.fillRect(bx + 4, H * 0.5 - bh + 10, 4, 4);
        ctx.fillRect(bx + 12, H * 0.5 - bh + 25, 4, 4);
        ctx.fillStyle = '#090d1a';
      }

      // Cyber Horizon Glow
      ctx.strokeStyle = isBoosting ? '#38bdf8' : '#818cf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.5);
      ctx.lineTo(W, H * 0.5);
      ctx.stroke();

      // Road geometry projection
      const horizonY = H * 0.5;
      const roadH = H - horizonY;
      const lines = 60;

      for (let i = lines; i >= 1; i--) {
        const p1 = (i - 1) / lines;
        const p2 = i / lines;

        const y1 = horizonY + Math.pow(p1, 2) * roadH;
        const y2 = horizonY + Math.pow(p2, 2) * roadH;

        const w1 = W * 0.15 + (W * 0.7) * Math.pow(p1, 1.8);
        const w2 = W * 0.15 + (W * 0.7) * Math.pow(p2, 1.8);

        const curveShift1 = (Math.pow(1 - p1, 2)) * st.curve * (W * 0.25);
        const curveShift2 = (Math.pow(1 - p2, 2)) * st.curve * (W * 0.25);

        const cx1 = W * 0.5 + curveShift1;
        const cx2 = W * 0.5 + curveShift2;

        // Asphalt stripe alternating
        const isSegmentAlt = Math.floor((i + st.roadOffset * 10) % 2) === 0;

        ctx.fillStyle = isSegmentAlt ? '#0f172a' : '#0b1120';
        ctx.beginPath();
        ctx.moveTo(cx1 - w1 / 2, y1);
        ctx.lineTo(cx1 + w1 / 2, y1);
        ctx.lineTo(cx2 + w2 / 2, y2);
        ctx.lineTo(cx2 - w2 / 2, y2);
        ctx.closePath();
        ctx.fill();

        // Neon Curbs
        ctx.fillStyle = isSegmentAlt ? '#a855f7' : '#38bdf8';
        const curbW1 = w1 * 0.05;
        const curbW2 = w2 * 0.05;

        // Left curb
        ctx.beginPath();
        ctx.moveTo(cx1 - w1 / 2, y1);
        ctx.lineTo(cx1 - w1 / 2 + curbW1, y1);
        ctx.lineTo(cx2 - w2 / 2 + curbW2, y2);
        ctx.lineTo(cx2 - w2 / 2, y2);
        ctx.fill();

        // Right curb
        ctx.beginPath();
        ctx.moveTo(cx1 + w1 / 2 - curbW1, y1);
        ctx.lineTo(cx1 + w1 / 2, y1);
        ctx.lineTo(cx2 + w2 / 2, y2);
        ctx.lineTo(cx2 + w2 / 2 - curbW2, y2);
        ctx.fill();

        // Dashed Lane Dividers
        if (isSegmentAlt) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          const lw1 = Math.max(2, w1 * 0.015);
          const lw2 = Math.max(2, w2 * 0.015);
          ctx.beginPath();
          ctx.moveTo(cx1 - lw1 / 2, y1);
          ctx.lineTo(cx1 + lw1 / 2, y1);
          ctx.lineTo(cx2 + lw2 / 2, y2);
          ctx.lineTo(cx2 - lw2 / 2, y2);
          ctx.fill();
        }
      }

      // Draw Collectible Nitro Orbs (projected by Z distance)
      st.orbs.forEach(orb => {
        if (orb.collected || orb.z < 50 || orb.z > 2000) return;
        const scale = 180 / orb.z;
        const curveOffset = Math.pow(1 - scale, 2) * st.curve * (W * 0.25);
        const ox = W * 0.5 + curveOffset + (orb.x * (W * 0.7) * scale);
        const oy = horizonY + Math.pow(scale, 1.8) * roadH - (15 * scale);
        const radius = Math.max(4, 16 * scale);

        ctx.save();
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(ox, oy, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ox, oy, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Traffic Cars (projected by Z distance)
      const sortedTraffic = [...st.traffic].sort((a, b) => b.z - a.z);
      sortedTraffic.forEach(car => {
        if (car.z < 50 || car.z > 2200) return;
        const scale = 200 / car.z;
        const curveOffset = Math.pow(1 - scale, 2) * st.curve * (W * 0.25);
        const carX = W * 0.5 + curveOffset + (car.x * (W * 0.7) * scale);
        const carY = horizonY + Math.pow(scale, 1.8) * roadH;

        const cw = Math.max(18, (W * 0.18) * scale);
        const ch = Math.max(10, cw * 0.55);

        ctx.save();
        // Car chassis
        ctx.fillStyle = car.color;
        ctx.shadowColor = car.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(carX - cw / 2, carY - ch, cw, ch);

        // Windshield & roof
        ctx.fillStyle = '#111827';
        ctx.fillRect(carX - cw * 0.35, carY - ch * 1.3, cw * 0.7, ch * 0.5);

        // Tail lights
        ctx.fillStyle = '#ff2222';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fillRect(carX - cw * 0.45, carY - ch * 0.6, cw * 0.25, ch * 0.3);
        ctx.fillRect(carX + cw * 0.2, carY - ch * 0.6, cw * 0.25, ch * 0.3);

        ctx.restore();
      });

      // Draw Player Neon Supercar (Fixed Z position at bottom center)
      const playerScreenX = W * 0.5 + (st.playerX * W * 0.38);
      const playerScreenY = H - 45;
      const pw = 84;
      const ph = 46;

      ctx.save();
      // Nitro flame exhaust if active
      if (st.isNitroActive) {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 25;
        // left flame
        ctx.beginPath();
        ctx.moveTo(playerScreenX - pw * 0.35, playerScreenY);
        ctx.lineTo(playerScreenX - pw * 0.25, playerScreenY + 28 + Math.random() * 12);
        ctx.lineTo(playerScreenX - pw * 0.15, playerScreenY);
        ctx.fill();
        // right flame
        ctx.beginPath();
        ctx.moveTo(playerScreenX + pw * 0.15, playerScreenY);
        ctx.lineTo(playerScreenX + pw * 0.25, playerScreenY + 28 + Math.random() * 12);
        ctx.lineTo(playerScreenX + pw * 0.35, playerScreenY);
        ctx.fill();
      }

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.ellipse(playerScreenX, playerScreenY + 5, pw * 0.6, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Car body (Neon Cyberpunk Supercar)
      ctx.shadowColor = st.isNitroActive ? '#38bdf8' : '#a855f7';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = st.isNitroActive ? '#38bdf8' : '#a855f7';
      ctx.lineWidth = 3;

      // Aerodynamic wedge profile
      ctx.beginPath();
      ctx.moveTo(playerScreenX - pw / 2, playerScreenY);
      ctx.lineTo(playerScreenX - pw * 0.4, playerScreenY - ph * 0.5);
      ctx.lineTo(playerScreenX - pw * 0.28, playerScreenY - ph);
      ctx.lineTo(playerScreenX + pw * 0.28, playerScreenY - ph);
      ctx.lineTo(playerScreenX + pw * 0.4, playerScreenY - ph * 0.5);
      ctx.lineTo(playerScreenX + pw / 2, playerScreenY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Neon Cockpit canopy
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(playerScreenX - pw * 0.22, playerScreenY - ph * 0.45);
      ctx.lineTo(playerScreenX - pw * 0.16, playerScreenY - ph * 0.85);
      ctx.lineTo(playerScreenX + pw * 0.16, playerScreenY - ph * 0.85);
      ctx.lineTo(playerScreenX + pw * 0.22, playerScreenY - ph * 0.45);
      ctx.closePath();
      ctx.fill();

      // Neon Cyan accent lines
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playerScreenX - pw * 0.38, playerScreenY - 6);
      ctx.lineTo(playerScreenX + pw * 0.38, playerScreenY - 6);
      ctx.stroke();

      // Glowing Neon Tail lights
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#e11d48';
      ctx.shadowBlur = 12;
      ctx.fillRect(playerScreenX - pw * 0.42, playerScreenY - 14, 16, 5);
      ctx.fillRect(playerScreenX + pw * 0.42 - 16, playerScreenY - 14, 16, 5);

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, triggerGameOver]);

  const handleMobileSteer = (dir: 'left' | 'right' | 'none') => {
    if (dir === 'left') {
      stateRef.current.keys.left = true;
      stateRef.current.keys.right = false;
    } else if (dir === 'right') {
      stateRef.current.keys.right = true;
      stateRef.current.keys.left = false;
    } else {
      stateRef.current.keys.left = false;
      stateRef.current.keys.right = false;
    }
  };

  const handleMobileBoost = (boost: boolean) => {
    stateRef.current.keys.boost = boost;
  };

  return (
    <div ref={containerRef} className="relative w-full aspect-[16/10] max-h-[700px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center select-none shadow-2xl">
      {/* HUD Header */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent">
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Score:</span>
            <span className="font-mono text-amber-300 font-bold tabular-nums text-sm">{score}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <span className="text-slate-400">Speed:</span>
            <span className="font-mono text-cyan-400 font-bold tabular-nums text-sm">{speed} km/h</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <Zap className={`w-3.5 h-3.5 ${nitro > 20 ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <div className="w-16 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-75"
                style={{ width: `${nitro}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          {gameState === 'PLAYING' && (
            <button
              onClick={handlePause}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/80 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Pause (P)
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full h-full object-cover"
      />

      {/* START OVERLAY */}
      {gameState === 'START' && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Zap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Neon Drift: Tokyo Horizon 3D
          </h2>
          <p className="max-w-md text-sm text-slate-400 mt-2 mb-6">
            Dodge expressway traffic, collect glowing blue nitro orbs, and test your reflexes at supersonic highway speeds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 mb-8 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800">
            <span>Controls: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300">A / D</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300">← / →</kbd> to steer</span>
            <span>·</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300">Space</kbd> for Nitro Turbo</span>
          </div>

          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Engine
          </button>
        </div>
      )}

      {/* PAUSE OVERLAY */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-2xl font-bold text-white font-display mb-2">Game Paused</h3>
          <p className="text-xs text-slate-400 mb-6">Take a breath, champion. Press P or Resume to dive back in.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePause}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors"
            >
              Resume Game
            </button>
            <button
              onClick={handleStartGame}
              className="px-5 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restart
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER OVERLAY */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3 text-rose-400">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-white font-display tracking-tight">Expressway Crash</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">Your chassis sustained critical damage.</p>

          <div className="grid grid-cols-2 gap-4 max-w-xs w-full mb-6">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Final Distance</span>
              <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">{score} m</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Best Record</span>
              <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">{Math.max(score, highScore)} m</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartGame}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-400 hover:to-blue-500 shadow-md transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        </div>
      )}

      {/* ON-SCREEN MOBILE TOUCH CONTROLS */}
      {gameState === 'PLAYING' && (
        <div className="md:hidden absolute bottom-3 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onTouchStart={() => handleMobileSteer('left')}
              onTouchEnd={() => handleMobileSteer('none')}
              onMouseDown={() => handleMobileSteer('left')}
              onMouseUp={() => handleMobileSteer('none')}
              className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white font-bold text-lg active:bg-cyan-600 flex items-center justify-center shadow-lg"
            >
              ◀
            </button>
            <button
              onTouchStart={() => handleMobileSteer('right')}
              onTouchEnd={() => handleMobileSteer('none')}
              onMouseDown={() => handleMobileSteer('right')}
              onMouseUp={() => handleMobileSteer('none')}
              className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white font-bold text-lg active:bg-cyan-600 flex items-center justify-center shadow-lg"
            >
              ▶
            </button>
          </div>

          <div className="pointer-events-auto">
            <button
              onTouchStart={() => handleMobileBoost(true)}
              onTouchEnd={() => handleMobileBoost(false)}
              onMouseDown={() => handleMobileBoost(true)}
              onMouseUp={() => handleMobileBoost(false)}
              className="w-16 h-12 rounded-xl bg-cyan-600/80 border border-cyan-400/80 text-white font-bold text-xs active:bg-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30"
            >
              NITRO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
