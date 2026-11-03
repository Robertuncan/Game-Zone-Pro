import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Brain, Trophy, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface MemoryMatrixPuzzleProps {
  onGameOver?: (score: number) => void;
}

export const MemoryMatrixPuzzle: React.FC<MemoryMatrixPuzzleProps> = ({ onGameOver }) => {
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const gridSize = 9; // 3x3 grid

  const playSequence = (seq: number[]) => {
    setIsShowingSequence(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < seq.length) {
        setActiveNode(seq[i]);
        soundManager.playScore();
        setTimeout(() => setActiveNode(null), 350);
        i++;
      } else {
        clearInterval(interval);
        setIsShowingSequence(false);
      }
    }, 600);
  };

  const handleStartGame = () => {
    const initialSeq = [Math.floor(Math.random() * gridSize)];
    setLevel(1);
    setScore(0);
    setSequence(initialSeq);
    setUserStep(0);
    setGameState('PLAYING');
    setTimeout(() => playSequence(initialSeq), 500);
  };

  const handleNodeClick = (nodeIndex: number) => {
    if (isShowingSequence || gameState !== 'PLAYING') return;

    soundManager.playLaser();
    setActiveNode(nodeIndex);
    setTimeout(() => setActiveNode(null), 250);

    if (nodeIndex === sequence[userStep]) {
      const nextStep = userStep + 1;
      if (nextStep === sequence.length) {
        // Completed this round!
        const addedScore = level * 100;
        setScore(prev => prev + addedScore);
        soundManager.playCoin();

        const nextLevel = level + 1;
        setLevel(nextLevel);
        setUserStep(0);

        const newSeq = [...sequence, Math.floor(Math.random() * gridSize)];
        setSequence(newSeq);
        setTimeout(() => playSequence(newSeq), 800);
      } else {
        setUserStep(nextStep);
      }
    } else {
      // Mistake!
      soundManager.playGameOver();
      setGameState('GAMEOVER');
      if (onGameOver) onGameOver(score);
    }
  };

  return (
    <div className="relative w-full aspect-[16/10] max-h-[700px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center p-4 select-none shadow-2xl">
      {/* HUD Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Level</span>
            <span className="text-sm font-bold font-mono text-cyan-400">{level}</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Score</span>
            <span className="text-sm font-bold font-mono text-amber-400 tabular-nums">{score}</span>
          </div>
        </div>

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

      {/* 3x3 Matrix Grid */}
      <div className="relative p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-full max-w-xs aspect-square grid grid-cols-3 grid-rows-3 gap-3">
        {Array.from({ length: gridSize }).map((_, idx) => {
          const isActive = activeNode === idx;
          return (
            <button
              key={idx}
              onClick={() => handleNodeClick(idx)}
              disabled={isShowingSequence || gameState !== 'PLAYING'}
              className={`rounded-xl transition-all duration-150 flex items-center justify-center border font-display font-bold ${
                isActive
                  ? 'bg-cyan-400 border-cyan-200 shadow-lg shadow-cyan-400/50 scale-105 text-slate-950'
                  : 'bg-slate-950/70 border-slate-800 text-slate-600 hover:border-slate-700 active:scale-95'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}

        {/* START OVERLAY */}
        {gameState === 'START' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center z-20 animate-fadeIn">
            <Brain className="w-10 h-10 text-cyan-400 mb-2" />
            <h4 className="text-xl font-extrabold text-white font-display mb-1">Synapse Matrix</h4>
            <p className="text-xs text-slate-400 mb-4">Memorize the flashing sequence and repeat it step by step.</p>
            <button
              onClick={handleStartGame}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors shadow-md"
            >
              Start Recall
            </button>
          </div>
        )}

        {/* GAMEOVER OVERLAY */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center z-20 animate-fadeIn">
            <h4 className="text-xl font-extrabold text-white font-display mb-1">Sequence Broken</h4>
            <p className="text-xs text-slate-400 mb-4">You reached Level {level} with {score} points.</p>
            <button
              onClick={handleStartGame}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors shadow-md"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-slate-500">
        {isShowingSequence ? '👀 Watch carefully...' : gameState === 'PLAYING' ? '👉 Replicate the pattern!' : ''}
      </div>
    </div>
  );
};
