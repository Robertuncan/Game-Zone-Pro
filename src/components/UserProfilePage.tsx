import React, { useState } from 'react';
import {
  User,
  Crown,
  Heart,
  Clock,
  Trophy,
  Shield,
  Play,
  LogOut,
  Edit3,
  Check,
  Calendar,
  Sparkles
} from 'lucide-react';
import { UserProfile, Game } from '../types/game';
import { storageService } from '../services/storageService';

interface UserProfilePageProps {
  user: UserProfile;
  games: Game[];
  onPlayGame: (game: Game) => void;
  onOpenUpgrade: () => void;
  onUserUpdated: (user: UserProfile) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
];

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  user,
  games,
  onPlayGame,
  onOpenUpgrade,
  onUserUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'settings'>('favorites');
  const [isEditingName, setIsEditingName] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user.username);

  const favoriteGames = games.filter(g => user.favorites.includes(g.id));

  const handleSaveUsername = () => {
    if (!usernameInput.trim()) return;
    const updated = { ...user, username: usernameInput.trim() };
    storageService.saveUser(updated);
    onUserUpdated(updated);
    setIsEditingName(false);
  };

  const handleSelectAvatar = (avatarUrl: string) => {
    const updated = { ...user, avatar: avatarUrl };
    storageService.saveUser(updated);
    onUserUpdated(updated);
  };

  const handleCancelSubscription = () => {
    if (confirm('Cancel active GameZone Pro subscription? You will retain access until the end of your billing cycle.')) {
      const updated = storageService.cancelSubscription();
      onUserUpdated(updated);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Card Header */}
      <div className="bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Pro Ring */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-2xl p-[2px] ${
              user.isPremium
                ? 'bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 shadow-xl shadow-amber-500/20'
                : 'bg-slate-700'
            }`}>
              <img
                src={user.avatar}
                alt={user.username}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-[14px] object-cover"
              />
            </div>
            {user.isPremium && (
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-amber-500 text-slate-950 font-black shadow-lg">
                <Crown className="w-4 h-4 fill-current" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="px-3 py-1 bg-slate-950 dark:bg-slate-950 bg-slate-100 border border-slate-700 rounded-lg text-sm text-white dark:text-white text-slate-900 focus:outline-none focus:border-cyan-500 font-bold"
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="p-1.5 bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-display font-black text-2xl sm:text-3xl text-white dark:text-white text-slate-900">
                    {user.username}
                  </h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center sm:justify-start gap-2">
                {user.isPremium ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20">
                    <Crown className="w-3.5 h-3.5 fill-current" /> Pro Member
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                    Free Player
                  </span>
                )}
                {user.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-500 mt-1">
              {user.email}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Joined {user.joinedAt}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{user.history.length} Sessions Played</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>{user.favorites.length} Wishlist Titles</span>
              </div>
            </div>
          </div>

          {/* Action Upgrade / Subscription Status */}
          <div className="shrink-0 text-center sm:text-right">
            {!user.isPremium ? (
              <button
                onClick={onOpenUpgrade}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <Crown className="w-4 h-4 fill-current" />
                <span>Upgrade to Pro</span>
              </button>
            ) : (
              <div className="space-y-1">
                <span className="text-[11px] text-emerald-400 font-semibold block">
                  ✓ Active ({user.premiumTier} tier)
                </span>
                <button
                  onClick={handleCancelSubscription}
                  className="text-[11px] text-slate-500 hover:text-rose-400 underline transition-colors"
                >
                  Manage / Cancel Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Favorites | Recently Played | Account Settings */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 dark:border-slate-800 border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'favorites'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>My Favorites ({favoriteGames.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'history'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Game History ({user.history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'settings'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Avatar & Preferences</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'favorites' && (
        <div>
          {favoriteGames.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-3xl">
              <Heart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="font-display font-bold text-base text-white dark:text-white text-slate-900 mb-1">
                No Favorite Games Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click the heart icon on any game card to bookmark your top favorites for quick launching.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoriteGames.map(game => (
                <div
                  key={game.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-3 flex items-center justify-between gap-3"
                >
                  <img
                    src={game.thumbnail}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-xs text-white block truncate">{game.title}</span>
                    <span className="text-[11px] text-cyan-400">{game.category}</span>
                  </div>
                  <button
                    onClick={() => onPlayGame(game)}
                    className="p-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-all shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl overflow-hidden shadow-xl">
          <div className="divide-y divide-slate-800/80 dark:divide-slate-800/80 divide-slate-200">
            {user.history.map((hist, idx) => {
              const matchedGame = games.find(g => g.id === hist.gameId);
              return (
                <div
                  key={idx}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white dark:text-white text-slate-900 block">
                        {hist.gameTitle || matchedGame?.title || 'Arcade Match'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Played at {new Date(hist.playedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {hist.score !== undefined && (
                      <span className="font-mono font-bold text-amber-400 text-xs tabular-nums">
                        {hist.score.toLocaleString()} PTS
                      </span>
                    )}
                    {matchedGame && (
                      <button
                        onClick={() => onPlayGame(matchedGame)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" /> Replay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl p-6 shadow-xl">
          <h3 className="font-display font-bold text-base text-white dark:text-white text-slate-900 mb-4">
            Select Gamer Avatar
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
            {AVATAR_PRESETS.map((av, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAvatar(av)}
                className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-transform hover:scale-105 ${
                  user.avatar === av ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-700'
                }`}
              >
                <img src={av} alt="Preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
