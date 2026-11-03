import React, { useState } from 'react';
import { Play, Star, Users, Heart, Crown, Sparkles } from 'lucide-react';
import { Game } from '../types/game';

interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onPlay: (game: Game) => void;
  onToggleFavorite: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isFavorite,
  onPlay,
  onToggleFavorite
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative flex flex-col bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-200">
      {/* Thumbnail Aspect Container (4:3) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
        {!imgError ? (
          <img
            src={game.thumbnail}
            alt={game.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-center">
            <Sparkles className="w-8 h-8 text-cyan-400 mb-2 opacity-80" />
            <span className="text-xs font-bold text-slate-300">{game.title}</span>
          </div>
        )}

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Free or Premium Badge */}
        <div className="absolute top-3 left-3 z-10">
          {game.isPremium ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md">
              <Crown className="w-3 h-3 fill-current" /> Premium
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/90 text-white shadow-md">
              Free
            </span>
          )}
        </div>

        {/* Favorite Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game.id);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-colors ${
            isFavorite
              ? 'bg-rose-500 text-white'
              : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Live Hover Overlay with Instant Play CTA */}
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <button
            onClick={() => onPlay(game)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-400/30 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Play Now
          </button>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="flex flex-col flex-1 p-4">
        {/* Unboxed Metadata Line (Category · Players · Rating) */}
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 text-slate-500 mb-1.5">
          <span className="font-medium text-cyan-400 dark:text-cyan-400 text-cyan-600">{game.category}</span>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span className="tabular-nums">{(game.playersCount / 1000).toFixed(1)}k</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="tabular-nums font-semibold">{game.rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-base text-white dark:text-white text-slate-900 group-hover:text-cyan-400 transition-colors line-clamp-1">
          {game.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-600 mt-1 line-clamp-2 leading-relaxed flex-1">
          {game.description}
        </p>

        {/* Footer Action */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 dark:border-slate-800/80 border-slate-200/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-500 text-slate-400">
            {game.developer}
          </span>
          <button
            onClick={() => onPlay(game)}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 dark:text-cyan-400 text-cyan-600 hover:text-cyan-300 transition-colors"
          >
            <span>Play</span>
            <Play className="w-3 h-3 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
