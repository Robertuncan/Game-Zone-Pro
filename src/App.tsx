/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Crown,
  Trophy,
  Sparkles,
  Gamepad2,
  Heart,
  TrendingUp,
  Star,
  Users,
  Shield,
  ArrowRight
} from 'lucide-react';
import { Game, UserProfile, GameCategory } from './types/game';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoriesSection } from './components/CategoriesSection';
import { GameCard } from './components/GameCard';
import { GamePlayerPage } from './components/GamePlayerPage';
import { PricingModal } from './components/PricingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { UserProfilePage } from './components/UserProfilePage';
import { LeaderboardsPage } from './components/LeaderboardsPage';

type ViewType = 'home' | 'games' | 'categories' | 'leaderboards' | 'premium' | 'admin' | 'profile';

export default function App() {
  const [games, setGames] = useState<Game[]>(() => storageService.getGames());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storageService.getUser());
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [playingGame, setPlayingGame] = useState<Game | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'All'>('All');
  const [filterTier, setFilterTier] = useState<'all' | 'free' | 'premium'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');

  // Modals & Theme
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gamezone_theme');
      return saved ? saved === 'dark' : true; // Default dark gaming theme
    }
    return true;
  });

  // Apply dark class to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gamezone_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gamezone_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handlePlayGame = (game: Game) => {
    setPlayingGame(game);
  };

  const handleToggleFavorite = (gameId: string) => {
    const updated = storageService.toggleFavorite(gameId);
    setCurrentUser(prev => ({ ...prev, favorites: updated }));
  };

  const handleOpenUpgrade = () => {
    setIsPricingModalOpen(true);
  };

  // Filtered & Sorted Games Computation
  const filteredGames = useMemo(() => {
    return games
      .filter(game => {
        // Search filter
        const matchesSearch =
          searchQuery.trim() === '' ||
          game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

        // Category filter
        const matchesCategory =
          selectedCategory === 'All' ||
          game.category === selectedCategory ||
          game.secondaryCategories?.includes(selectedCategory);

        // Tier filter
        const matchesTier =
          filterTier === 'all' ||
          (filterTier === 'free' && !game.isPremium) ||
          (filterTier === 'premium' && game.isPremium);

        return matchesSearch && matchesCategory && matchesTier;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        return b.playersCount - a.playersCount; // popular
      });
  }, [games, searchQuery, selectedCategory, filterTier, sortBy]);

  // Curated collections for Homepage
  const featuredGame = games.find(g => g.featured) || games[0];
  const trendingGames = games.filter(g => g.trending);
  const popularGames = games.filter(g => g.popular);
  const premiumGames = games.filter(g => g.isPremium);
  const recommendedGames = games.filter(g => g.recommended || g.rating >= 4.8);

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 bg-slate-50 text-slate-100 dark:text-slate-100 text-slate-900 transition-colors flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        activeView={playingGame ? 'games' : activeView}
        onNavigate={(view) => {
          setPlayingGame(null);
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenUpgrade={handleOpenUpgrade}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {playingGame ? (
          /* Dedicated Game Playing Screen */
          <GamePlayerPage
            game={playingGame}
            user={currentUser}
            isFavorite={currentUser.favorites.includes(playingGame.id)}
            onBack={() => setPlayingGame(null)}
            onToggleFavorite={handleToggleFavorite}
            onOpenUpgrade={handleOpenUpgrade}
          />
        ) : activeView === 'admin' ? (
          /* Admin Dashboard */
          <AdminDashboard
            currentUser={currentUser}
            games={games}
            onGamesUpdated={(updated) => setGames(updated)}
            onUserUpdated={(updated) => setCurrentUser(updated)}
          />
        ) : activeView === 'profile' ? (
          /* User Profile & Library */
          <UserProfilePage
            user={currentUser}
            games={games}
            onPlayGame={handlePlayGame}
            onOpenUpgrade={handleOpenUpgrade}
            onUserUpdated={(updated) => setCurrentUser(updated)}
          />
        ) : activeView === 'leaderboards' ? (
          /* Global Leaderboards */
          <LeaderboardsPage
            games={games}
            onPlayGame={handlePlayGame}
          />
        ) : activeView === 'premium' ? (
          /* Premium Membership Showcase */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>MEMBERSHIP TIERS & SUBSCRIPTIONS</span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-white dark:text-white text-slate-900 tracking-tight">
                Unlock The Full GameZone Pro Vault
              </h1>
              <p className="text-sm text-slate-400 dark:text-slate-400 text-slate-600 mt-3 leading-relaxed">
                Play unrestricted high-octane premium games, access global competitive leaderboards, and enjoy ad-free gaming with verified secure checkout.
              </p>
            </div>

            {/* Pricing Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
              {/* Free Plan */}
              <div className="p-6 bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-3xl flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Starter</span>
                  <h3 className="font-display font-bold text-xl text-white dark:text-white text-slate-900 mb-2">Free Membership</h3>
                  <div className="font-display font-black text-3xl text-white dark:text-white text-slate-900 mb-6">$0</div>
                  <ul className="space-y-2.5 text-xs text-slate-400 dark:text-slate-400 text-slate-600">
                    <li>✓ Access to 120+ free HTML5 titles</li>
                    <li>✓ Community ratings & reviews</li>
                    <li>✓ Basic casual leaderboards</li>
                    <li>✓ Browser cloud saved progress</li>
                  </ul>
                </div>
                <div className="mt-8 py-2.5 text-center text-xs font-bold text-slate-400 bg-slate-800 rounded-xl">
                  {currentUser.isPremium ? 'Basic Features Included' : 'Current Active Plan'}
                </div>
              </div>

              {/* Monthly Pro Plan */}
              <div className="p-6 bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-700 dark:border-slate-700 border-slate-300 rounded-3xl flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">Flexible</span>
                  <h3 className="font-display font-bold text-xl text-white dark:text-white text-slate-900 mb-2">Monthly Pro</h3>
                  <div className="font-display font-black text-3xl text-white dark:text-white text-slate-900 mb-6">
                    $9.99<span className="text-xs text-slate-400 font-normal"> / month</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300 dark:text-slate-300 text-slate-700">
                    <li>✓ All 20+ Premium game releases</li>
                    <li>✓ Completely Ad-Free experience</li>
                    <li>✓ Gold PRO Gamer insignia</li>
                    <li>✓ High score verification badge</li>
                    <li>✓ Cancel anytime in 1-click</li>
                  </ul>
                </div>
                <button
                  onClick={handleOpenUpgrade}
                  className="mt-8 w-full py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-400/20"
                >
                  {currentUser.isPremium && currentUser.premiumTier === 'monthly' ? 'Current Plan (Active)' : 'Subscribe Monthly · $9.99'}
                </button>
              </div>

              {/* Annual Pro Plan */}
              <div className="relative p-6 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 border-2 border-amber-500/60 rounded-3xl flex flex-col justify-between shadow-2xl">
                <span className="absolute -top-3 right-6 px-3 py-1 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                  Best Value · Save 33%
                </span>
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">Championship Pass</span>
                  <h3 className="font-display font-bold text-xl text-white mb-2">Annual Pass</h3>
                  <div className="font-display font-black text-3xl text-white mb-6">
                    $79.99<span className="text-xs text-slate-400 font-normal"> / year</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li>✓ Complete library & all upcoming releases</li>
                    <li>✓ 12 months for the price of 8 ($6.60/mo)</li>
                    <li>✓ VIP community tournament entry</li>
                    <li>✓ Priority fast-lane server streaming</li>
                    <li>✓ Lifetime stats archive</li>
                  </ul>
                </div>
                <button
                  onClick={handleOpenUpgrade}
                  className="mt-8 w-full py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-xl transition-all shadow-lg shadow-amber-500/25"
                >
                  {currentUser.isPremium && currentUser.premiumTier === 'yearly' ? 'Current Plan (Active)' : 'Subscribe Annual · $79.99'}
                </button>
              </div>
            </div>

            {/* Premium Games Showcase Grid */}
            <div className="mb-8">
              <h2 className="font-display font-extrabold text-2xl text-white dark:text-white text-slate-900 mb-6">
                Premium-Exclusive Library
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {premiumGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={currentUser.favorites.includes(game.id)}
                    onPlay={handlePlayGame}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* HOMEPAGE OR ALL GAMES VIEW */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section (On Home view only) */}
            {activeView === 'home' && (
              <HeroSection
                featuredGame={featuredGame}
                onPlay={handlePlayGame}
                onExplore={() => {
                  const gamesElem = document.getElementById('search-games-section');
                  gamesElem?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* Categories Grid (On Home & Categories views) */}
            {(activeView === 'home' || activeView === 'categories') && (
              <CategoriesSection
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  const searchElem = document.getElementById('search-games-section');
                  searchElem?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* Trending Games Strip (On Home view only) */}
            {activeView === 'home' && selectedCategory === 'All' && searchQuery === '' && (
              <section className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                      <Flame className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h2 className="font-display font-extrabold text-2xl text-white dark:text-white text-slate-900 tracking-tight">
                        Trending Right Now
                      </h2>
                      <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-500">
                        Highest player activity and rapid player growth in the last 24 hours.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {trendingGames.slice(0, 4).map(game => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isFavorite={currentUser.favorites.includes(game.id)}
                      onPlay={handlePlayGame}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Search & Filter Anchor Section */}
            <section id="search-games-section" className="mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-2xl shadow-xl mb-6">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, genre, tags (e.g. drift, 2048, soccer, arcade)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 dark:bg-slate-950/80 bg-slate-50 border border-slate-800 dark:border-slate-800 border-slate-200 rounded-xl text-xs text-white dark:text-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Filter Controls (Segmented Tabs & Sort) */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  {/* Free / Premium segmented control */}
                  <div className="flex items-center p-1 bg-slate-950/80 dark:bg-slate-950/80 bg-slate-100 rounded-xl border border-slate-800 dark:border-slate-800 border-slate-200">
                    <button
                      onClick={() => setFilterTier('all')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        filterTier === 'all'
                          ? 'bg-slate-800 dark:bg-slate-800 bg-white text-white dark:text-white text-slate-900 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterTier('free')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        filterTier === 'free'
                          ? 'bg-slate-800 dark:bg-slate-800 bg-white text-emerald-400 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Free
                    </button>
                    <button
                      onClick={() => setFilterTier('premium')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                        filterTier === 'premium'
                          ? 'bg-slate-800 dark:bg-slate-800 bg-white text-amber-400 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>Premium</span>
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'popular' | 'rating' | 'newest')}
                    className="px-3 py-2 bg-slate-950/80 dark:bg-slate-950/80 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-200 rounded-xl text-xs text-slate-300 dark:text-slate-300 text-slate-700 focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Recently Added</option>
                  </select>
                </div>
              </div>

              {/* Active Category Header if filtered */}
              {selectedCategory !== 'All' && (
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-xs text-slate-400">
                    Showing results for category: <strong className="text-cyan-400 font-bold">{selectedCategory}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="text-xs text-slate-500 hover:text-white underline"
                  >
                    Reset Filter
                  </button>
                </div>
              )}

              {/* Games Grid */}
              {filteredGames.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-3xl p-6">
                  <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-display font-bold text-lg text-white dark:text-white text-slate-900 mb-1">
                    No Matching Games Found
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                    Try adjusting your search keywords, clear category filters, or switch to All Games.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setFilterTier('all');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-xl hover:bg-cyan-300 transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredGames.map(game => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isFavorite={currentUser.favorites.includes(game.id)}
                      onPlay={handlePlayGame}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Recommended Games Collection (On Home view only) */}
            {activeView === 'home' && selectedCategory === 'All' && searchQuery === '' && (
              <section className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display font-extrabold text-2xl text-white dark:text-white text-slate-900 tracking-tight">
                      Recommended for You
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-500">
                      Curated titles based on high player engagement and community reviews.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {recommendedGames.slice(0, 4).map(game => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isFavorite={currentUser.favorites.includes(game.id)}
                      onPlay={handlePlayGame}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Pricing Upgrade Modal */}
      <PricingModal
        user={currentUser}
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSuccess={(updatedUser) => setCurrentUser(updatedUser)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 dark:border-slate-800 border-slate-200 bg-slate-950 dark:bg-slate-950 bg-white py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80 dark:border-slate-800/80 border-slate-200/80 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              <span className="font-display font-bold text-white dark:text-white text-slate-900 text-sm">
                GameZone Pro
              </span>
              <span>— The Premier Browser Gaming Portal</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={() => {
                  setPlayingGame(null);
                  setActiveView('games');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors"
              >
                All 150+ Games
              </button>
              <button
                onClick={() => {
                  setPlayingGame(null);
                  setActiveView('categories');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors"
              >
                15 Categories
              </button>
              <button
                onClick={() => {
                  setPlayingGame(null);
                  setActiveView('leaderboards');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors"
              >
                Leaderboards
              </button>
              <button
                onClick={() => {
                  setPlayingGame(null);
                  setActiveView('premium');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors"
              >
                Membership Pricing
              </button>
              <button
                onClick={() => {
                  setPlayingGame(null);
                  setActiveView('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-purple-400 transition-colors"
              >
                Admin Panel
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
            <span>© 2026 GameZone Pro Interactive. Built with genuine HTML5 physics engines.</span>
            <span>Zero downloads required · Safe encrypted gaming</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
