import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Flame, Shield, ArrowRight, Clock, Star, Trophy } from 'lucide-react';
import { Game } from '../types/game';

interface HeroSectionProps {
  featuredGame: Game;
  onPlay: (game: Game) => void;
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredGame,
  onPlay,
  onExplore
}) => {
  // Live countdown to next daily game rotation (e.g. 07h 42m 19s)
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 34, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format2 = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl mb-12">
      {/* Background Cinematic Artwork with Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_gaming_showcase_1793687185837.jpg"
          alt="Gaming Arena"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-40 scale-105 transform hover:scale-100 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-7xl mx-auto flex flex-col justify-between min-h-[520px]">
        {/* Top Badges / Kicker */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 fill-current text-cyan-400 animate-pulse" />
            <span>Game of the Day</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium backdrop-blur-md">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Rotates in:</span>
            <span className="font-mono text-cyan-300 font-bold tabular-nums">
              {format2(timeLeft.hours)}:{format2(timeLeft.minutes)}:{format2(timeLeft.seconds)}
            </span>
          </div>
        </div>

        {/* Center Hero Information */}
        <div className="max-w-2xl mt-6 mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span className="font-semibold text-cyan-400">{featuredGame.category}</span>
            <span aria-hidden="true">·</span>
            <span>By {featuredGame.developer}</span>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold">{featuredGame.rating}</span>
              <span className="text-slate-400">({featuredGame.ratingCount})</span>
            </div>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08] text-balance">
            {featuredGame.title}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed line-clamp-3 max-w-xl">
            {featuredGame.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onPlay(featuredGame)}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Now Free</span>
            </button>

            <button
              onClick={onExplore}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors backdrop-blur-md"
            >
              <span>Explore All 150+ Games</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Platform Trust Strip */}
        <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Instant Play</span>
            <span className="font-display font-bold text-base text-white">0 Downloads Needed</span>
          </div>
          <div>
            <span className="text-slate-400 block">Active Community</span>
            <span className="font-display font-bold text-base text-cyan-400 tabular-nums">54,000+ Online</span>
          </div>
          <div>
            <span className="text-slate-400 block">Curated Catalog</span>
            <span className="font-display font-bold text-base text-white">15 Categories</span>
          </div>
          <div>
            <span className="text-slate-400 block">Cross Platform</span>
            <span className="font-display font-bold text-base text-white">Desktop & Mobile</span>
          </div>
        </div>
      </div>
    </div>
  );
};
