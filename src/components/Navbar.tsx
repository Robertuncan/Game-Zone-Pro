import React from 'react';
import { Gamepad2, Sparkles, Sun, Moon, Shield, Crown, User, Search } from 'lucide-react';
import { UserProfile } from '../types/game';

interface NavbarProps {
  user: UserProfile;
  activeView: 'home' | 'games' | 'categories' | 'leaderboards' | 'premium' | 'admin' | 'profile';
  onNavigate: (view: 'home' | 'games' | 'categories' | 'leaderboards' | 'premium' | 'admin' | 'profile') => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenUpgrade: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  onNavigate,
  isDarkMode,
  onToggleTheme,
  onOpenUpgrade
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/85 dark:bg-slate-950/85 bg-white/90 border-b border-slate-800 dark:border-slate-800 border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-lg tracking-tight text-white dark:text-white text-slate-900">
              GameZone<span className="text-cyan-400">Pro</span>
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap transition-colors ${
              activeView === 'home'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white text-slate-600 hover:text-slate-900'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => onNavigate('games')}
            className={`whitespace-nowrap transition-colors ${
              activeView === 'games'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white text-slate-600 hover:text-slate-900'
            }`}
          >
            All Games
          </button>
          <button
            onClick={() => onNavigate('categories')}
            className={`whitespace-nowrap transition-colors ${
              activeView === 'categories'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white text-slate-600 hover:text-slate-900'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => onNavigate('leaderboards')}
            className={`whitespace-nowrap transition-colors ${
              activeView === 'leaderboards'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white text-slate-600 hover:text-slate-900'
            }`}
          >
            Leaderboards
          </button>
          <button
            onClick={() => onNavigate('premium')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeView === 'premium'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-amber-300 dark:text-slate-400 text-slate-600'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Premium</span>
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeView === 'admin'
                ? 'text-purple-400 font-semibold'
                : 'text-slate-400 hover:text-purple-300 dark:text-slate-400 text-slate-600'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white text-slate-600 hover:text-slate-900 bg-slate-900/60 dark:bg-slate-900/60 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-200 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Premium Membership Button / Badge */}
          {!user.isPremium ? (
            <button
              onClick={onOpenUpgrade}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-all hover:scale-105"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Get Premium</span>
            </button>
          ) : (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-md">
              <Crown className="w-3 h-3 text-amber-400" /> PRO
            </span>
          )}

          {/* User Profile Avatar CTA */}
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-200 hover:border-cyan-500/50 transition-all"
          >
            <img
              src={user.avatar}
              alt={user.username}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-lg object-cover border border-slate-700"
            />
            <span className="hidden lg:block text-xs font-semibold text-slate-200 dark:text-slate-200 text-slate-800 max-w-[100px] truncate">
              {user.username}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
