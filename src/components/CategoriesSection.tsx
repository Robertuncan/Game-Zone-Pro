import React from 'react';
import {
  Flame,
  Gauge,
  Car,
  Crosshair,
  Puzzle,
  Compass,
  Gamepad2,
  Trophy,
  CircleDot,
  Dribbble,
  Shield,
  Users,
  Brain,
  Coffee,
  Box,
  ChevronRight
} from 'lucide-react';
import { CATEGORIES_LIST } from '../data/initialGames';
import { GameCategory } from '../types/game';

interface CategoriesSectionProps {
  selectedCategory: GameCategory | 'All';
  onSelectCategory: (cat: GameCategory | 'All') => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Action: <Flame className="w-5 h-5 text-rose-400" />,
  Racing: <Gauge className="w-5 h-5 text-cyan-400" />,
  Car: <Car className="w-5 h-5 text-blue-400" />,
  Shooting: <Crosshair className="w-5 h-5 text-amber-400" />,
  Puzzle: <Puzzle className="w-5 h-5 text-purple-400" />,
  Adventure: <Compass className="w-5 h-5 text-emerald-400" />,
  Arcade: <Gamepad2 className="w-5 h-5 text-fuchsia-400" />,
  Sports: <Trophy className="w-5 h-5 text-yellow-400" />,
  Football: <CircleDot className="w-5 h-5 text-teal-400" />,
  Basketball: <Dribbble className="w-5 h-5 text-orange-400" />,
  Strategy: <Shield className="w-5 h-5 text-indigo-400" />,
  Multiplayer: <Users className="w-5 h-5 text-sky-400" />,
  Brain: <Brain className="w-5 h-5 text-pink-400" />,
  Casual: <Coffee className="w-5 h-5 text-lime-400" />,
  '3D': <Box className="w-5 h-5 text-cyan-300" />
};

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white dark:text-white text-slate-900 tracking-tight">
            Explore 15 Game Categories
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-500 mt-1">
            Pick your favorite genre or filter the instant play library.
          </p>
        </div>

        {selectedCategory !== 'All' && (
          <button
            onClick={() => onSelectCategory('All')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Show All Games
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {CATEGORIES_LIST.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? 'All' : cat.id)}
              className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 group relative ${
                isSelected
                  ? 'bg-cyan-950/60 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 dark:bg-slate-900/60 bg-white border-slate-800 dark:border-slate-800 border-slate-200 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="p-2 rounded-xl bg-slate-800/80 dark:bg-slate-800/80 bg-slate-100 group-hover:scale-110 transition-transform">
                  {CATEGORY_ICONS[cat.id] || <Gamepad2 className="w-5 h-5 text-cyan-400" />}
                </div>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400 text-slate-500">
                  {cat.count}
                </span>
              </div>

              <span className="font-display font-bold text-sm text-white dark:text-white text-slate-900 group-hover:text-cyan-400 transition-colors line-clamp-1">
                {cat.id}
              </span>

              <span className="text-[11px] text-slate-400 dark:text-slate-400 text-slate-500 line-clamp-1 mt-0.5">
                {cat.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
