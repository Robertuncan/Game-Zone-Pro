import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Crosshair, Shield, RefreshCw } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface TacticalStrikeBattleProps {
  onGameOver?: (score: number) => void;
}

interface Hostile {
  id: number;
  x: number;
  y: number;
  hp: number;
  angle: number;
  patrolDir: number;
  alive: boolean;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const TacticalStrikeBattle: React.FC<TacticalStrikeBattleProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'>('START');
  const [score, setScore] = useState(0);
  const [ammo, setAmmo] = useState(12);
  const [hp, setHp] = useState(100);
  const [isReloading, setIsReloading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const stateRef = useRef({
    player: { x: 100, y: 250, r: 16, angle: 0, speed: 200, hp: 100 },
    keys: { w: false, a: false, s: false, d: false },
    mouse: { x: 400, y: 250 },
    hostiles: [] as Hostile[],
    bullets: [] as Bullet[],
    covers: [
      { x: 260, y: 120, w: 40, h: 100 },
      { x: 260, y: 300, w: 40, h: 100 },
      { x: 480, y: 180, w: 60, h: 140 }
    ],
    ammo: 12,
    maxAmmo: 12,
    score: 0
  });

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const initHostiles = (): Hostile[] => [
    { id: 1, x: 650, y: 120, hp: 3, angle: Math.PI, patrolDir: 1, alive: true },
    { id: 2, x: 680, y: 250, hp: 4, angle: Math.PI, patrolDir: -1, alive: true },
    { id: 3, x: 650, y: 380, hp: 3, angle: Math.PI, patrolDir: 1, alive: true },
    { id: 4, x: 520, y: 80, hp: 2, angle: Math.PI * 0.8, patrolDir: 1, alive: true }
  ];

  const handleStartGame = () => {
    stateRef.current = {
      player: { x: 100, y: 250, r: 16, angle: 0, speed: 200, hp: 100 },
      keys: { w: false, a: false, s: false, d: false },
      mouse: { x: 400, y: 250 },
      hostiles: initHostiles(),
      bullets: [],
      covers: [
        { x: 260, y: 120, w: 40, h: 100 },
        { x: 260, y: 300, w: 40, h: 100 },
        { x: 480, y: 180, w: 60, h: 140 }
      ],
      ammo: 12,
      maxAmmo: 12,
      score: 0
    };
    setScore(0);
    setHp(100);
    setAmmo(12);
    setIsReloading(false);
    setGameState('PLAYING');
    soundManager.playScore();
  };

  const reloadWeapon = () => {
    if (isReloading || stateRef.current.ammo === stateRef.current.maxAmmo) return;
    setIsReloading(true);
    soundManager.playClick();
    setTimeout(() => {
      stateRef.current.ammo = stateRef.current.maxAmmo;
      setAmmo(stateRef.current.maxAmmo);
      setIsReloading(false);
      soundManager.playClick();
    }, 1100);
  };

  const fireWeapon = () => {
    const st = stateRef.current;
    if (gameState !== 'PLAYING' || isReloading) return;
    if (st.ammo <= 0) {
      reloadWeapon();
      return;
    }

    st.ammo -= 1;
    setAmmo(st.ammo);
    soundManager.playLaser();

    // Spawn bullet along player orientation towards mouse
    const angle = Math.atan2(st.mouse.y - st.player.y, st.mouse.x - st.player.x);
    st.bullets.push({
      x: st.player.x + Math.cos(angle) * 22,
      y: st.player.y + Math.sin(angle) * 22,
      vx: Math.cos(angle) * 750,
      vy: Math.sin(angle) * 750
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['KeyW', 'ArrowUp'].includes(e.code)) stateRef.current.keys.w = true;
      if (['KeyA', 'ArrowLeft'].includes(e.code)) stateRef.current.keys.a = true;
      if (['KeyS', 'ArrowDown'].includes(e.code)) stateRef.current.keys.s = true;
      if (['KeyD', 'ArrowRight'].includes(e.code)) stateRef.current.keys.d = true;
      if (e.code === 'KeyR') reloadWeapon();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['KeyW', 'ArrowUp'].includes(e.code)) stateRef.current.keys.w = false;
      if (['KeyA', 'ArrowLeft'].includes(e.code)) stateRef.current.keys.a = false;
      if (['KeyS', 'ArrowDown'].includes(e.code)) stateRef.current.keys.s = false;
      if (['KeyD', 'ArrowRight'].includes(e.code)) stateRef.current.keys.d = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isReloading]);

  // Main Loop
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

      // Update Player Movement
      let mx = 0;
      let my = 0;
      if (st.keys.w) my -= 1;
      if (st.keys.s) my += 1;
      if (st.keys.a) mx -= 1;
      if (st.keys.d) mx += 1;

      if (mx !== 0 && my !== 0) {
        mx *= 0.707;
        my *= 0.707;
      }

      const newPx = Math.max(20, Math.min(W - 20, st.player.x + mx * st.player.speed * dt));
      const newPy = Math.max(20, Math.min(H - 20, st.player.y + my * st.player.speed * dt));

      // Simple collision with covers
      let canMove = true;
      st.covers.forEach(c => {
        if (newPx > c.x - 14 && newPx < c.x + c.w + 14 && newPy > c.y - 14 && newPy < c.y + c.h + 14) {
          canMove = false;
        }
      });
      if (canMove) {
        st.player.x = newPx;
        st.player.y = newPy;
      }

      // Player rotation to mouse
      st.player.angle = Math.atan2(st.mouse.y - st.player.y, st.mouse.x - st.player.x);

      // Update Hostiles Patrol & Line of Sight
      let allNeutralized = true;
      st.hostiles.forEach(h => {
        if (!h.alive) return;
        allNeutralized = false;

        h.y += h.patrolDir * 70 * dt;
        if (h.y > 420) h.patrolDir = -1;
        if (h.y < 80) h.patrolDir = 1;

        // Aim at player
        h.angle = Math.atan2(st.player.y - h.y, st.player.x - h.x);

        // Hostile fires occasionally if in range
        if (Math.random() < 0.012) {
          st.bullets.push({
            x: h.x,
            y: h.y,
            vx: Math.cos(h.angle) * 380,
            vy: Math.sin(h.angle) * 380
          });
        }
      });

      if (allNeutralized) {
        setGameState('VICTORY');
        soundManager.playVictory();
        if (onGameOver) onGameOver(st.score + 2500);
        return;
      }

      // Update Bullets
      for (let i = st.bullets.length - 1; i >= 0; i--) {
        const b = st.bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Collision with covers absorbs bullet
        let absorbed = false;
        st.covers.forEach(c => {
          if (b.x >= c.x && b.x <= c.x + c.w && b.y >= c.y && b.y <= c.y + c.h) {
            absorbed = true;
          }
        });

        // Collision with Player
        if (Math.hypot(b.x - st.player.x, b.y - st.player.y) < st.player.r) {
          st.player.hp -= 15;
          setHp(Math.max(0, st.player.hp));
          soundManager.playExplosion();
          absorbed = true;
          if (st.player.hp <= 0) {
            setGameState('GAMEOVER');
            soundManager.playGameOver();
            if (onGameOver) onGameOver(st.score);
            return;
          }
        }

        // Collision with Hostiles
        st.hostiles.forEach(h => {
          if (!h.alive) return;
          if (Math.hypot(b.x - h.x, b.y - h.y) < 22) {
            h.hp -= 1;
            absorbed = true;
            soundManager.playLaser();
            if (h.hp <= 0) {
              h.alive = false;
              st.score += 500;
              setScore(st.score);
              soundManager.playExplosion();
            }
          }
        });

        if (absorbed || b.x < 0 || b.x > W || b.y < 0 || b.y > H) {
          st.bullets.splice(i, 1);
        }
      }

      // --- RENDER ARENA ---
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      // Tactical grid pattern
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Draw Covers / Crates
      st.covers.forEach(c => {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeRect(c.x, c.y, c.w, c.h);
        // Diagonal crate reinforcement line
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + c.w, c.y + c.h);
        ctx.stroke();
      });

      // Draw Bullets
      st.bullets.forEach(b => {
        ctx.save();
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#d97706';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Hostiles
      st.hostiles.forEach(h => {
        if (!h.alive) return;
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.angle);

        // Hostile body
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Hostile weapon
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(8, -3, 14, 6);

        ctx.restore();
      });

      // Draw Player Operative
      ctx.save();
      ctx.translate(st.player.x, st.player.y);
      ctx.rotate(st.player.angle);

      // Operative Helmet / Shoulders
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, st.player.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Silenced Tactical Rifle
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(8, -4, 20, 8);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(28, -2, 6, 4);

      ctx.restore();

      // Draw Crosshair at Mouse
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(st.mouse.x, st.mouse.y, 8, 0, Math.PI * 2);
      ctx.moveTo(st.mouse.x - 12, st.mouse.y);
      ctx.lineTo(st.mouse.x + 12, st.mouse.y);
      ctx.moveTo(st.mouse.x, st.mouse.y - 12);
      ctx.lineTo(st.mouse.x, st.mouse.y + 12);
      ctx.stroke();
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
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <div className="w-16 sm:w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 transition-all" style={{ width: `${hp}%` }} />
            </div>
            <span className="font-mono text-cyan-300 tabular-nums">{hp}%</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Ammo:</span>
            <span className="font-mono text-amber-300 font-bold tabular-nums text-sm">
              {isReloading ? 'RELOADING...' : `${ammo} / 12`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={reloadWeapon}
            disabled={isReloading}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
            <span>Reload (R)</span>
          </button>
          <button
            onClick={toggleMute}
            className="p-2 text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          stateRef.current.mouse.x = ((e.clientX - rect.left) / rect.width) * 800;
          stateRef.current.mouse.y = ((e.clientY - rect.top) / rect.height) * 500;
        }}
        onClick={fireWeapon}
        className="w-full h-full object-cover cursor-crosshair"
      />

      {/* START MODAL */}
      {gameState === 'START' && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight mb-2">
            Shadow Operative: Tactical Strike
          </h2>
          <p className="max-w-md text-sm text-slate-400 mb-6">
            Neutralize hostile defense forces using precision cover maneuvers and silenced firepower. Move with W/A/S/D and click to eliminate hostiles.
          </p>
          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Infiltrate Compound
          </button>
        </div>
      )}

      {/* GAMEOVER */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <h3 className="text-2xl font-black text-white font-display tracking-tight">Operative Compromised</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">Your vital signs dropped to zero.</p>
          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-all shadow-md active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Restart Mission
          </button>
        </div>
      )}

      {/* VICTORY */}
      {gameState === 'VICTORY' && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <h3 className="text-2xl font-black text-white font-display tracking-tight text-emerald-400">Sector Secured!</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">All hostile operatives eliminated.</p>
          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-all shadow-md active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Next Mission
          </button>
        </div>
      )}
    </div>
  );
};
