import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Shield, Crosshair, Bomb } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface SpaceDefenderProps {
  onGameOver?: (score: number) => void;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isEnemy: boolean;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  type: 'drone' | 'scout' | 'cruiser';
  shootCooldown: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export const SpaceDefender: React.FC<SpaceDefenderProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [shield, setShield] = useState(100);
  const [wave, setWave] = useState(1);
  const [bombs, setBombs] = useState(2);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gamezone_hiscore_space') || '0', 10);
  });
  const [isMuted, setIsMuted] = useState(false);

  const stateRef = useRef({
    player: { x: 400, y: 420, vx: 0, vy: 0, shield: 100, maxShield: 100, tripleShot: 0 },
    keys: { left: false, right: false, up: false, down: false, fire: false },
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    stars: [] as { x: number; y: number; s: number; speed: number }[],
    wave: 1,
    bombs: 2,
    score: 0,
    fireTimer: 0,
    enemySpawnTimer: 0
  });

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const initStars = () => {
    const stars = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        s: Math.random() * 2 + 1,
        speed: Math.random() * 1.5 + 0.5
      });
    }
    return stars;
  };

  const handleStartGame = () => {
    stateRef.current = {
      player: { x: 400, y: 420, vx: 0, vy: 0, shield: 100, maxShield: 100, tripleShot: 0 },
      keys: { left: false, right: false, up: false, down: false, fire: false },
      bullets: [],
      enemies: [],
      particles: [],
      stars: initStars(),
      wave: 1,
      bombs: 2,
      score: 0,
      fireTimer: 0,
      enemySpawnTimer: 0
    };
    setScore(0);
    setShield(100);
    setWave(1);
    setBombs(2);
    setGameState('PLAYING');
    soundManager.playEngineAccelerate();
  };

  const triggerGameOver = useCallback((finalScore: number) => {
    setGameState('GAMEOVER');
    soundManager.playGameOver();
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('gamezone_hiscore_space', finalScore.toString());
    }
    if (onGameOver) {
      onGameOver(finalScore);
    }
  }, [highScore, onGameOver]);

  const deployBomb = () => {
    if (stateRef.current.bombs <= 0 || gameState !== 'PLAYING') return;
    stateRef.current.bombs -= 1;
    setBombs(stateRef.current.bombs);
    soundManager.playExplosion();

    // Kill all onscreen enemies
    const currentEnemies = stateRef.current.enemies;
    currentEnemies.forEach(e => {
      // spawn particles
      for (let p = 0; p < 12; p++) {
        stateRef.current.particles.push({
          x: e.x,
          y: e.y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 0.6,
          color: '#f59e0b'
        });
      }
    });

    stateRef.current.score += currentEnemies.length * 200;
    stateRef.current.enemies = [];
    stateRef.current.bullets = stateRef.current.bullets.filter(b => !b.isEnemy);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) stateRef.current.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) stateRef.current.keys.right = true;
      if (['ArrowUp', 'KeyW'].includes(e.code)) stateRef.current.keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) stateRef.current.keys.down = true;
      if (['Space'].includes(e.code)) stateRef.current.keys.fire = true;
      if (e.code === 'KeyB') deployBomb();
      if (e.code === 'KeyP' || e.code === 'Escape') {
        setGameState(prev => (prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) stateRef.current.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) stateRef.current.keys.right = false;
      if (['ArrowUp', 'KeyW'].includes(e.code)) stateRef.current.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) stateRef.current.keys.down = false;
      if (['Space'].includes(e.code)) stateRef.current.keys.fire = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

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

      // Player Movement
      const moveSpeed = 320;
      if (st.keys.left) st.player.x -= moveSpeed * dt;
      if (st.keys.right) st.player.x += moveSpeed * dt;
      if (st.keys.up) st.player.y -= moveSpeed * dt;
      if (st.keys.down) st.player.y += moveSpeed * dt;

      st.player.x = Math.max(30, Math.min(W - 30, st.player.x));
      st.player.y = Math.max(120, Math.min(H - 40, st.player.y));

      // Player Firing
      st.fireTimer += dt;
      if (st.keys.fire && st.fireTimer >= 0.14) {
        st.fireTimer = 0;
        soundManager.playLaser();
        if (st.player.tripleShot > 0) {
          st.bullets.push({ x: st.player.x - 14, y: st.player.y - 15, vx: -40, vy: -600, isEnemy: false });
          st.bullets.push({ x: st.player.x, y: st.player.y - 20, vx: 0, vy: -650, isEnemy: false });
          st.bullets.push({ x: st.player.x + 14, y: st.player.y - 15, vx: 40, vy: -600, isEnemy: false });
          st.player.tripleShot -= dt;
        } else {
          st.bullets.push({ x: st.player.x - 12, y: st.player.y - 15, vx: 0, vy: -600, isEnemy: false });
          st.bullets.push({ x: st.player.x + 12, y: st.player.y - 15, vx: 0, vy: -600, isEnemy: false });
        }
      }

      // Spawn Enemies
      st.enemySpawnTimer += dt;
      const spawnInterval = Math.max(0.6, 2.2 - st.wave * 0.25);
      if (st.enemySpawnTimer > spawnInterval) {
        st.enemySpawnTimer = 0;
        const rand = Math.random();
        if (rand < 0.6) {
          st.enemies.push({
            id: Date.now() + Math.random(),
            x: Math.random() * (W - 80) + 40,
            y: -30,
            hp: 2,
            maxHp: 2,
            type: 'drone',
            shootCooldown: 1.5 + Math.random()
          });
        } else if (rand < 0.88) {
          st.enemies.push({
            id: Date.now() + Math.random(),
            x: Math.random() * (W - 80) + 40,
            y: -30,
            hp: 4,
            maxHp: 4,
            type: 'scout',
            shootCooldown: 1.2
          });
        } else {
          st.enemies.push({
            id: Date.now() + Math.random(),
            x: Math.random() * (W - 120) + 60,
            y: -50,
            hp: 12,
            maxHp: 12,
            type: 'cruiser',
            shootCooldown: 2.0
          });
        }
      }

      // Update Enemies
      for (let i = st.enemies.length - 1; i >= 0; i--) {
        const e = st.enemies[i];
        if (e.type === 'drone') {
          e.y += (110 + st.wave * 10) * dt;
          e.x += Math.sin(e.y * 0.03) * 60 * dt;
        } else if (e.type === 'scout') {
          e.y += (160 + st.wave * 15) * dt;
        } else {
          e.y += 50 * dt;
        }

        // Enemy firing
        e.shootCooldown -= dt;
        if (e.shootCooldown <= 0 && e.y < H - 100) {
          e.shootCooldown = 2.0 + Math.random() * 1.5;
          st.bullets.push({
            x: e.x,
            y: e.y + 15,
            vx: (st.player.x - e.x) * 0.4,
            vy: 240,
            isEnemy: true
          });
        }

        // Player Collision
        const dist = Math.hypot(e.x - st.player.x, e.y - st.player.y);
        if (dist < 32) {
          st.player.shield -= 25;
          setShield(Math.max(0, Math.floor(st.player.shield)));
          soundManager.playExplosion();
          st.enemies.splice(i, 1);
          if (st.player.shield <= 0) {
            triggerGameOver(st.score);
            return;
          }
          continue;
        }

        if (e.y > H + 50) {
          st.enemies.splice(i, 1);
        }
      }

      // Update Bullets
      for (let i = st.bullets.length - 1; i >= 0; i--) {
        const b = st.bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Player hit by enemy bullet
        if (b.isEnemy) {
          const d = Math.hypot(b.x - st.player.x, b.y - st.player.y);
          if (d < 20) {
            st.player.shield -= 12;
            setShield(Math.max(0, Math.floor(st.player.shield)));
            soundManager.playExplosion();
            st.bullets.splice(i, 1);
            if (st.player.shield <= 0) {
              triggerGameOver(st.score);
              return;
            }
            continue;
          }
        } else {
          // Player bullet hitting enemy
          for (let j = st.enemies.length - 1; j >= 0; j--) {
            const en = st.enemies[j];
            const hitR = en.type === 'cruiser' ? 35 : 22;
            if (Math.hypot(b.x - en.x, b.y - en.y) < hitR) {
              en.hp -= 1;
              st.bullets.splice(i, 1);

              // Particle sparks
              for (let p = 0; p < 4; p++) {
                st.particles.push({
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  life: 0.3,
                  color: '#38bdf8'
                });
              }

              if (en.hp <= 0) {
                soundManager.playExplosion();
                const points = en.type === 'cruiser' ? 300 : en.type === 'scout' ? 150 : 80;
                st.score += points;
                setScore(st.score);

                // Chance to give triple shot or shield restore
                if (Math.random() < 0.15) {
                  st.player.tripleShot = 8;
                  st.player.shield = Math.min(100, st.player.shield + 20);
                  setShield(Math.floor(st.player.shield));
                  soundManager.playCoin();
                }

                // Check wave advancement
                if (st.score > st.wave * 1200) {
                  st.wave += 1;
                  setWave(st.wave);
                  soundManager.playScore();
                }

                // Big explosion particles
                for (let p = 0; p < 12; p++) {
                  st.particles.push({
                    x: en.x,
                    y: en.y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    life: 0.5,
                    color: '#f97316'
                  });
                }
                st.enemies.splice(j, 1);
              }
              break;
            }
          }
        }

        if (b.y < -30 || b.y > H + 30 || b.x < -30 || b.x > W + 30) {
          st.bullets.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const p = st.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;
        if (p.life <= 0) st.particles.splice(i, 1);
      }

      // --- DRAW CANVAS ---
      ctx.fillStyle = '#060814';
      ctx.fillRect(0, 0, W, H);

      // Starfield parallax
      ctx.fillStyle = '#ffffff';
      st.stars.forEach(star => {
        star.y += star.speed;
        if (star.y > H) {
          star.y = 0;
          star.x = Math.random() * W;
        }
        ctx.fillRect(star.x, star.y, star.s, star.s);
      });

      // Draw Bullets
      st.bullets.forEach(b => {
        ctx.save();
        if (b.isEnemy) {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 10;
          ctx.fillRect(b.x - 2, b.y - 10, 4, 18);
        }
        ctx.restore();
      });

      // Draw Enemies
      st.enemies.forEach(en => {
        ctx.save();
        if (en.type === 'drone') {
          ctx.fillStyle = '#a855f7';
          ctx.shadowColor = '#9333ea';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(en.x, en.y + 14);
          ctx.lineTo(en.x - 14, en.y - 12);
          ctx.lineTo(en.x + 14, en.y - 12);
          ctx.closePath();
          ctx.fill();
        } else if (en.type === 'scout') {
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#e11d48';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(en.x, en.y + 18);
          ctx.lineTo(en.x - 18, en.y - 10);
          ctx.lineTo(en.x, en.y - 2);
          ctx.lineTo(en.x + 18, en.y - 10);
          ctx.closePath();
          ctx.fill();
        } else {
          // Cruiser
          ctx.fillStyle = '#eab308';
          ctx.shadowColor = '#ca8a04';
          ctx.shadowBlur = 12;
          ctx.fillRect(en.x - 26, en.y - 20, 52, 40);
          ctx.fillStyle = '#713f12';
          ctx.fillRect(en.x - 14, en.y - 10, 28, 20);
        }
        ctx.restore();
      });

      // Draw Particles
      st.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.life * 4), 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Player Fighter Jet
      ctx.save();
      const px = st.player.x;
      const py = st.player.y;

      // Engine Thruster Glow
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(px - 8, py + 16);
      ctx.lineTo(px, py + 30 + Math.random() * 8);
      ctx.lineTo(px + 8, py + 16);
      ctx.fill();

      // Fighter Hull
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py - 22);
      ctx.lineTo(px + 18, py + 16);
      ctx.lineTo(px + 8, py + 12);
      ctx.lineTo(px - 8, py + 12);
      ctx.lineTo(px - 18, py + 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wings & Cannons
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px - 26, py + 2, 8, 12);
      ctx.fillRect(px + 18, py + 2, 8, 12);

      // Cockpit
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(px, py - 4, 5, 0, Math.PI * 2);
      ctx.fill();

      // Energy Shield Bubble if damaged/protected
      if (st.player.shield > 0) {
        ctx.strokeStyle = st.player.shield > 40 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py - 2, 32, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, triggerGameOver]);

  const handleMobileDir = (dir: 'left' | 'right' | 'up' | 'down' | 'stop') => {
    stateRef.current.keys.left = dir === 'left';
    stateRef.current.keys.right = dir === 'right';
    stateRef.current.keys.up = dir === 'up';
    stateRef.current.keys.down = dir === 'down';
  };

  const handleMobileFire = (fire: boolean) => {
    stateRef.current.keys.fire = fire;
  };

  return (
    <div className="relative w-full aspect-[16/10] max-h-[700px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center select-none shadow-2xl">
      {/* Space HUD Header */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Score:</span>
            <span className="font-mono text-cyan-300 font-bold tabular-nums text-sm">{score}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <span className="text-slate-400">Wave:</span>
            <span className="font-mono text-amber-400 font-bold">{wave}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg">
            <Shield className={`w-3.5 h-3.5 ${shield < 30 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
            <div className="w-16 sm:w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${shield > 50 ? 'bg-emerald-400' : shield > 25 ? 'bg-amber-400' : 'bg-rose-500'}`}
                style={{ width: `${shield}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={deployBomb}
            disabled={bombs <= 0 || gameState !== 'PLAYING'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 disabled:opacity-40 transition-colors"
            title="Deploy Smart Bomb"
          >
            <Bomb className="w-3.5 h-3.5 text-amber-400" />
            <span>({bombs})</span>
          </button>

          <button
            onClick={toggleMute}
            className="p-2 text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-cover" />

      {/* START MODAL */}
      {gameState === 'START' && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Crosshair className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Galactic Vanguard: Nova Assault
          </h2>
          <p className="max-w-md text-sm text-slate-400 mt-2 mb-6">
            Command your Starfighter X-1, obliterate alien squadrons, and unleash tactical smart bombs across hostile nebulae.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 mb-8 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800">
            <span>Move: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300">W/A/S/D</kbd></span>
            <span>·</span>
            <span>Fire: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300">Space</kbd></span>
            <span>·</span>
            <span>Bomb: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300">B</kbd></span>
          </div>

          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Launch Fighter
          </button>
        </div>
      )}

      {/* GAME OVER */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-2xl font-black text-white font-display tracking-tight">Ship Destroyed</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">Your Starfighter X-1 fell in sector {wave}.</p>

          <div className="grid grid-cols-2 gap-4 max-w-xs w-full mb-6">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Final Score</span>
              <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">{score}</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Best Score</span>
              <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">{Math.max(score, highScore)}</span>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-400 hover:to-blue-500 shadow-md transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Re-engage
          </button>
        </div>
      )}

      {/* MOBILE CONTROLS */}
      {gameState === 'PLAYING' && (
        <div className="md:hidden absolute bottom-3 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="grid grid-cols-3 gap-1 pointer-events-auto">
            <div />
            <button
              onTouchStart={() => handleMobileDir('up')}
              onTouchEnd={() => handleMobileDir('stop')}
              className="w-10 h-10 bg-slate-900/80 rounded border border-slate-700 text-white font-bold"
            >
              ▲
            </button>
            <div />
            <button
              onTouchStart={() => handleMobileDir('left')}
              onTouchEnd={() => handleMobileDir('stop')}
              className="w-10 h-10 bg-slate-900/80 rounded border border-slate-700 text-white font-bold"
            >
              ◀
            </button>
            <button
              onTouchStart={() => handleMobileDir('down')}
              onTouchEnd={() => handleMobileDir('stop')}
              className="w-10 h-10 bg-slate-900/80 rounded border border-slate-700 text-white font-bold"
            >
              ▼
            </button>
            <button
              onTouchStart={() => handleMobileDir('right')}
              onTouchEnd={() => handleMobileDir('stop')}
              className="w-10 h-10 bg-slate-900/80 rounded border border-slate-700 text-white font-bold"
            >
              ▶
            </button>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onTouchStart={() => deployBomb()}
              className="w-12 h-12 rounded-xl bg-amber-600/80 border border-amber-400 text-white font-bold text-xs"
            >
              BOMB
            </button>
            <button
              onTouchStart={() => handleMobileFire(true)}
              onTouchEnd={() => handleMobileFire(false)}
              className="w-14 h-14 rounded-xl bg-cyan-600/80 border border-cyan-400 text-white font-bold text-xs"
            >
              FIRE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
