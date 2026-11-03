import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Heart,
  Share2,
  Star,
  Trophy,
  Users,
  Shield,
  Crown,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Game, UserProfile, GameReview, LeaderboardEntry } from '../types/game';
import { CyberRacer3D } from './games/CyberRacer3D';
import { SpaceDefender } from './games/SpaceDefender';
import { PenaltyShootout } from './games/PenaltyShootout';
import { BasketballShooter } from './games/BasketballShooter';
import { CyberFusion2048 } from './games/CyberFusion2048';
import { NeonBrickBreaker } from './games/NeonBrickBreaker';
import { TacticalStrikeBattle } from './games/TacticalStrikeBattle';
import { MemoryMatrixPuzzle } from './games/MemoryMatrixPuzzle';
import { SafeGameEmbed } from './games/SafeGameEmbed';
import { storageService } from '../services/storageService';

interface GamePlayerPageProps {
  game: Game;
  user: UserProfile;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenUpgrade: () => void;
}

export const GamePlayerPage: React.FC<GamePlayerPageProps> = ({
  game,
  user,
  isFavorite,
  onBack,
  onToggleFavorite,
  onOpenUpgrade
}) => {
  const [activeTab, setActiveTab] = useState<'instructions' | 'leaderboard' | 'reviews'>('instructions');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<GameReview[]>([]);
  const [userComment, setUserComment] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  // Record gameplay and load reviews & leaderboard
  useEffect(() => {
    storageService.recordGamePlay(game.id, game.title);
    setReviews(storageService.getReviews(game.id));
    setLeaderboard(storageService.getLeaderboard(game.id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [game]);

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleScoreSubmit = (score: number) => {
    const updated = storageService.submitScore(game.id, score);
    setLeaderboard(updated);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;

    const created = storageService.addReview({
      gameId: game.id,
      userId: user.id,
      userName: user.username,
      userAvatar: user.avatar,
      isPremium: user.isPremium,
      rating: userRating,
      comment: userComment.trim()
    });

    setReviews(prev => [created, ...prev]);
    setUserComment('');
    setHasReviewed(true);
  };

  // Check Premium Access Gate
  const isLocked = game.isPremium && !user.isPremium;

  const renderGameEngine = () => {
    if (isLocked) {
      return (
        <div className="relative w-full aspect-[16/10] max-h-[700px] bg-slate-950 rounded-2xl overflow-hidden border border-amber-500/40 flex flex-col items-center justify-center p-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/20">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Premium Exclusive Title
          </h2>
          <p className="max-w-md text-sm text-slate-300 mt-2 mb-6">
            <strong className="text-white">{game.title}</strong> is part of GameZone Pro Premium. Unlock unrestricted access to all high-octane premium games, leaderboards, and ad-free play.
          </p>
          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-xl hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Crown className="w-4 h-4 fill-current" />
            Upgrade to Premium Now
          </button>
        </div>
      );
    }

    switch (game.engineType) {
      case 'canvas-racer':
        return <CyberRacer3D onGameOver={handleScoreSubmit} />;
      case 'canvas-space-shooter':
        return <SpaceDefender onGameOver={handleScoreSubmit} />;
      case 'canvas-penalty-shootout':
        return <PenaltyShootout onGameOver={handleScoreSubmit} />;
      case 'canvas-basketball-3pt':
        return <BasketballShooter onGameOver={handleScoreSubmit} />;
      case 'canvas-cyber-fusion':
        return <CyberFusion2048 onGameOver={handleScoreSubmit} />;
      case 'canvas-brick-breaker':
        return <NeonBrickBreaker onGameOver={handleScoreSubmit} />;
      case 'canvas-tactical-strike':
        return <TacticalStrikeBattle onGameOver={handleScoreSubmit} />;
      case 'canvas-memory-matrix':
        return <MemoryMatrixPuzzle onGameOver={handleScoreSubmit} />;
      case 'embed':
        return (
          <SafeGameEmbed
            embedUrl={game.embedUrl || ''}
            gameTitle={game.title}
            onFallbackPlay={() => {}}
          />
        );
      default:
        return <CyberRacer3D onGameOver={handleScoreSubmit} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Game'}</span>
          </button>

          <button
            onClick={() => onToggleFavorite(game.id)}
            className={`p-2 rounded-lg border transition-colors ${
              isFavorite
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
            title="Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Main Game Playing Screen Box */}
      <div ref={gameContainerRef} className="relative w-full mb-8">
        {renderGameEngine()}
      </div>

      {/* Game Details & Metadata Banner */}
      <div className="bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 dark:border-slate-800/80 border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
              <span className="font-semibold text-cyan-400">{game.category}</span>
              <span aria-hidden="true">·</span>
              <span>Developer: {game.developer}</span>
              <span aria-hidden="true">·</span>
              <span>Released {game.releaseDate}</span>
              {game.isPremium && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                </>
              )}
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white dark:text-white text-slate-900">
              {game.title}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950/60 dark:bg-slate-950/60 bg-slate-100 rounded-xl border border-slate-800 dark:border-slate-800 border-slate-200">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <div>
                <span className="font-bold text-white dark:text-white text-slate-900 text-sm">{game.rating}</span>
                <span className="text-slate-400 text-[10px] block">({game.ratingCount} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950/60 dark:bg-slate-950/60 bg-slate-100 rounded-xl border border-slate-800 dark:border-slate-800 border-slate-200">
              <Users className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-bold text-white dark:text-white text-slate-900 text-sm">{(game.playersCount / 1000).toFixed(1)}k</span>
                <span className="text-slate-400 text-[10px] block">Active Players</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-300 dark:text-slate-300 text-slate-600 leading-relaxed max-w-4xl">
          {game.description}
        </p>

        {/* Secondary Category Tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-500">Tags:</span>
          {game.tags.map(tag => (
            <span key={tag} className="text-slate-400 hover:text-white transition-colors">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs: Instructions & Controls | Leaderboards | Reviews */}
      <div className="bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center gap-2 p-2 bg-slate-950/60 dark:bg-slate-950/60 bg-slate-100 border-b border-slate-800 dark:border-slate-800 border-slate-200">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'instructions'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>How to Play & Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>High Scores & Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Community Reviews ({reviews.length})</span>
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: Instructions & Controls */}
          {activeTab === 'instructions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display font-bold text-base text-white dark:text-white text-slate-900 mb-3">
                  Gameplay Rules & Objectives
                </h3>
                <ul className="space-y-2 text-xs text-slate-300 dark:text-slate-300 text-slate-600 leading-relaxed">
                  {game.instructions.map((ins, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <span>{ins}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-white dark:text-white text-slate-900 mb-3">
                  Control Mapping
                </h3>
                <div className="space-y-2">
                  {game.controls.map((ctrl, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 dark:bg-slate-950/60 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-200 text-xs"
                    >
                      <span className="font-medium text-slate-300 dark:text-slate-300 text-slate-700">
                        {ctrl.action}
                      </span>
                      <kbd className="px-2 py-1 bg-slate-800 dark:bg-slate-800 bg-white border border-slate-700 dark:border-slate-700 border-slate-300 rounded font-mono text-cyan-400 dark:text-cyan-400 text-cyan-600 text-[11px] font-bold">
                        {ctrl.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Leaderboard */}
          {activeTab === 'leaderboard' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-base text-white dark:text-white text-slate-900">
                  Global Hall of Fame
                </h3>
                <span className="text-xs text-slate-400">Play a session to automatically record your score</span>
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No records yet. Be the first champion to set a high score!
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80 dark:divide-slate-800/80 divide-slate-200">
                  {leaderboard.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between py-3 px-2 hover:bg-slate-800/40 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 text-center font-display font-bold text-sm ${
                          idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          #{idx + 1}
                        </span>
                        <img
                          src={entry.userAvatar}
                          alt={entry.userName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                        />
                        <span className="font-semibold text-xs text-white dark:text-white text-slate-900">
                          {entry.userName}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-[11px] text-slate-400 hidden sm:inline">{entry.date}</span>
                        <span className="font-mono font-bold text-cyan-400 text-sm tabular-nums">
                          {entry.score.toLocaleString()} PTS
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Write Review Form */}
              <form onSubmit={handleAddReview} className="p-4 bg-slate-950/60 dark:bg-slate-950/60 bg-slate-100 rounded-xl border border-slate-800 dark:border-slate-800 border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 dark:text-slate-300 text-slate-700 mb-3">
                  Write Your Community Review
                </h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-slate-400">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${star <= userRating ? 'text-amber-400 fill-current' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Share your thoughts on the physics, controls, or design..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-900 dark:bg-slate-900 bg-white border border-slate-700 dark:border-slate-700 border-slate-300 text-xs text-white dark:text-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Review</span>
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.map(r => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl bg-slate-950/40 dark:bg-slate-950/40 bg-slate-50 border border-slate-800/80 dark:border-slate-800/80 border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={r.userAvatar}
                          alt={r.userName}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-md object-cover border border-slate-700"
                        />
                        <span className="font-semibold text-xs text-white dark:text-white text-slate-900">
                          {r.userName}
                        </span>
                        {r.isPremium && (
                          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5" /> PRO
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 dark:text-slate-300 text-slate-600 leading-relaxed">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
