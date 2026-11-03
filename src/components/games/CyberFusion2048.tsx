import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Undo2, Trophy, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface CyberFusion2048Props {
  onGameOver?: (score: number) => void;
}

type Board = number[][];

export const CyberFusion2048: React.FC<CyberFusion2048Props> = ({ onGameOver }) => {
  const [board, setBoard] = useState<Board>(() => getInitialBoard());
  const [prevBoard, setPrevBoard] = useState<Board | null>(null);
  const [prevScore, setPrevScore] = useState<number>(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('gamezone_hiscore_2048') || '0', 10);
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  function getInitialBoard(): Board {
    const empty: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    addRandomTile(empty);
    addRandomTile(empty);
    return empty;
  }

  function addRandomTile(b: Board): boolean {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return false;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    b[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  const restartGame = () => {
    const fresh = getInitialBoard();
    setBoard(fresh);
    setPrevBoard(null);
    setScore(0);
    setIsGameOver(false);
    setHasWon(false);
    soundManager.playScore();
  };

  const undoMove = () => {
    if (prevBoard) {
      setBoard(prevBoard);
      setScore(prevScore);
      setPrevBoard(null);
      setIsGameOver(false);
      soundManager.playClick();
    }
  };

  const checkGameOver = (b: Board): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) return false;
        if (r < 3 && b[r][c] === b[r + 1][c]) return false;
        if (c < 3 && b[r][c] === b[r][c + 1]) return false;
      }
    }
    return true;
  };

  const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (isGameOver) return;

    let moved = false;
    let pointsEarned = 0;
    const newBoard = board.map(row => [...row]);

    const slideRow = (row: number[]): number[] => {
      let filtered = row.filter(val => val !== 0);
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          pointsEarned += filtered[i];
          if (filtered[i] === 2048 && !hasWon) {
            setHasWon(true);
            soundManager.playVictory();
          }
          filtered.splice(i + 1, 1);
        }
      }
      while (filtered.length < 4) {
        filtered.push(0);
      }
      return filtered;
    };

    if (direction === 'left') {
      for (let r = 0; r < 4; r++) {
        const orig = [...newBoard[r]];
        newBoard[r] = slideRow(newBoard[r]);
        if (orig.some((v, idx) => v !== newBoard[r][idx])) moved = true;
      }
    } else if (direction === 'right') {
      for (let r = 0; r < 4; r++) {
        const orig = [...newBoard[r]];
        const reversed = [...newBoard[r]].reverse();
        newBoard[r] = slideRow(reversed).reverse();
        if (orig.some((v, idx) => v !== newBoard[r][idx])) moved = true;
      }
    } else if (direction === 'up') {
      for (let c = 0; c < 4; c++) {
        const col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        const slid = slideRow(col);
        for (let r = 0; r < 4; r++) {
          if (newBoard[r][c] !== slid[r]) moved = true;
          newBoard[r][c] = slid[r];
        }
      }
    } else if (direction === 'down') {
      for (let c = 0; c < 4; c++) {
        const col = [newBoard[3][c], newBoard[2][c], newBoard[1][c], newBoard[0][c]];
        const slid = slideRow(col);
        for (let r = 0; r < 4; r++) {
          if (newBoard[3 - r][c] !== slid[r]) moved = true;
          newBoard[3 - r][c] = slid[r];
        }
      }
    }

    if (moved) {
      setPrevBoard(board);
      setPrevScore(score);
      addRandomTile(newBoard);
      setBoard(newBoard);

      const nextScore = score + pointsEarned;
      setScore(nextScore);
      if (pointsEarned > 0) {
        soundManager.playCoin();
      } else {
        soundManager.playClick();
      }

      if (nextScore > bestScore) {
        setBestScore(nextScore);
        localStorage.setItem('gamezone_hiscore_2048', nextScore.toString());
      }

      if (checkGameOver(newBoard)) {
        setIsGameOver(true);
        soundManager.playGameOver();
        if (onGameOver) onGameOver(nextScore);
      }
    }
  }, [board, score, bestScore, hasWon, isGameOver, onGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        move('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        move('right');
      } else if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        move('up');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        move('down');
      } else if (e.code === 'KeyU') {
        undoMove();
      } else if (e.code === 'KeyR') {
        restartGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const getTileStyles = (val: number) => {
    switch (val) {
      case 2: return 'bg-slate-800 text-slate-100 border border-slate-700';
      case 4: return 'bg-cyan-950 text-cyan-200 border border-cyan-800/60 shadow-cyan-900/30';
      case 8: return 'bg-blue-900 text-blue-100 border border-blue-600 shadow-blue-500/20';
      case 16: return 'bg-indigo-900 text-indigo-100 border border-indigo-500 shadow-indigo-500/20';
      case 32: return 'bg-purple-900 text-purple-100 border border-purple-500 shadow-purple-500/30';
      case 64: return 'bg-fuchsia-900 text-fuchsia-100 border border-fuchsia-500 shadow-fuchsia-500/30';
      case 128: return 'bg-amber-600 text-amber-50 border border-amber-400 shadow-lg shadow-amber-500/30 text-2xl font-bold';
      case 256: return 'bg-orange-600 text-orange-50 border border-orange-400 shadow-lg shadow-orange-500/30 text-2xl font-bold';
      case 512: return 'bg-rose-600 text-rose-50 border border-rose-400 shadow-lg shadow-rose-500/40 text-2xl font-bold';
      case 1024: return 'bg-emerald-600 text-white border border-emerald-300 shadow-lg shadow-emerald-500/50 text-xl font-extrabold';
      case 2048: return 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black shadow-xl shadow-yellow-400/50 text-xl animate-pulse';
      default: return 'bg-slate-900/40 border border-slate-800/60';
    }
  };

  return (
    <div className="relative w-full aspect-[16/10] max-h-[700px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center p-4 select-none shadow-2xl">
      {/* Header controls & Scoreboards */}
      <div className="w-full max-w-sm flex items-center justify-between mb-3 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Score</span>
            <span className="text-sm font-bold font-mono text-cyan-400 tabular-nums">{score}</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Best</span>
            <span className="text-sm font-bold font-mono text-amber-400 tabular-nums">{bestScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={undoMove}
            disabled={!prevBoard}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-30 hover:bg-slate-800 transition-colors"
            title="Undo move (U)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={restartGame}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            title="Restart (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              soundManager.setMuted(next);
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* 4x4 Grid Container */}
      <div className="relative p-2.5 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl w-full max-w-xs aspect-square grid grid-cols-4 grid-rows-4 gap-2">
        {board.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className={`rounded-xl flex items-center justify-center font-display font-semibold transition-all duration-100 ${getTileStyles(val)}`}
            >
              {val > 0 && <span className="tabular-nums">{val}</span>}
            </div>
          ))
        )}

        {/* GAME OVER OVERLAY */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center z-10 animate-fadeIn">
            <h4 className="text-xl font-extrabold text-white font-display mb-1">Grid Locked!</h4>
            <p className="text-xs text-slate-400 mb-4">No remaining valid merge moves.</p>
            <button
              onClick={restartGame}
              className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors shadow-md"
            >
              Play Again
            </button>
          </div>
        )}

        {/* 2048 VICTORY BANNER */}
        {hasWon && (
          <div className="absolute top-2 inset-x-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 p-2 rounded-xl text-center shadow-lg font-bold text-xs flex items-center justify-center gap-1.5 z-20">
            <Sparkles className="w-3.5 h-3.5" /> 2048 Fusion Core Reached! Keep going!
          </div>
        )}
      </div>

      {/* Mobile directional pad */}
      <div className="mt-3 flex items-center justify-center gap-2 md:hidden">
        <button onClick={() => move('left')} className="w-9 h-9 bg-slate-900 border border-slate-800 text-white rounded-lg font-bold">◀</button>
        <div className="flex flex-col gap-1">
          <button onClick={() => move('up')} className="w-9 h-9 bg-slate-900 border border-slate-800 text-white rounded-lg font-bold">▲</button>
          <button onClick={() => move('down')} className="w-9 h-9 bg-slate-900 border border-slate-800 text-white rounded-lg font-bold">▼</button>
        </div>
        <button onClick={() => move('right')} className="w-9 h-9 bg-slate-900 border border-slate-800 text-white rounded-lg font-bold">▶</button>
      </div>

      <div className="mt-3 text-[11px] text-slate-500 hidden sm:block">
        Use Arrow keys or W/A/S/D to slide tiles · Press U to Undo · Press R to Restart
      </div>
    </div>
  );
};
