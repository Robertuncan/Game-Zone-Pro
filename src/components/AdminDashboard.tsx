import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  Users,
  CreditCard,
  BarChart3,
  Gamepad2,
  CheckCircle,
  XCircle,
  Crown,
  Search,
  DollarSign,
  TrendingUp,
  FolderOpen
} from 'lucide-react';
import { Game, UserProfile, PaymentRecord, GameCategory, GameEngineType } from '../types/game';
import { storageService } from '../services/storageService';
import { CATEGORIES_LIST } from '../data/initialGames';

interface AdminDashboardProps {
  currentUser: UserProfile;
  games: Game[];
  onGamesUpdated: (games: Game[]) => void;
  onUserUpdated: (user: UserProfile) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  games,
  onGamesUpdated,
  onUserUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'games' | 'users' | 'subscriptions' | 'analytics'>('games');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Game Modal state
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<GameCategory>('Action');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formIsPremium, setFormIsPremium] = useState(false);
  const [formEngine, setFormEngine] = useState<GameEngineType>('canvas-racer');
  const [formEmbedUrl, setFormEmbedUrl] = useState('');
  const [formTags, setFormTags] = useState('Arcade, Action, 3D');

  // Payment Records
  const payments: PaymentRecord[] = storageService.getPaymentRecords();

  const handleOpenAddGame = () => {
    setEditingGameId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Action');
    setFormThumbnail('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80');
    setFormIsPremium(false);
    setFormEngine('canvas-racer');
    setFormEmbedUrl('');
    setFormTags('Action, Fast, Arcade');
    setIsGameModalOpen(true);
  };

  const handleOpenEditGame = (game: Game) => {
    setEditingGameId(game.id);
    setFormTitle(game.title);
    setFormDescription(game.description);
    setFormCategory(game.category);
    setFormThumbnail(game.thumbnail);
    setFormIsPremium(game.isPremium);
    setFormEngine(game.engineType);
    setFormEmbedUrl(game.embedUrl || '');
    setFormTags(game.tags.join(', '));
    setIsGameModalOpen(true);
  };

  const handleDeleteGame = (id: string) => {
    if (confirm('Are you sure you want to delete this game from the library?')) {
      const updated = storageService.deleteGame(id);
      onGamesUpdated(updated);
    }
  };

  const handleToggleGamePremium = (game: Game) => {
    const updatedGame: Game = { ...game, isPremium: !game.isPremium };
    const list = storageService.saveGame(updatedGame);
    onGamesUpdated(list);
  };

  const handleSaveGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const gameToSave: Game = {
      id: editingGameId || `game-custom-${Date.now()}`,
      title: formTitle.trim(),
      slug: formTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formDescription.trim() || 'Exciting gaming adventure powered by GameZone Pro.',
      category: formCategory,
      secondaryCategories: [formCategory],
      thumbnail: formThumbnail.trim() || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      isPremium: formIsPremium,
      rating: 4.8,
      ratingCount: 120,
      playersCount: 3400,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      engineType: formEngine,
      embedUrl: formEmbedUrl.trim() || undefined,
      instructions: [
        'Follow on-screen instructions.',
        'Use keyboard arrows or mouse to navigate.',
        'Beat the high score!'
      ],
      controls: [
        { key: 'Arrow Keys / WASD', action: 'Move / Steer' },
        { key: 'Space', action: 'Action / Boost' }
      ],
      releaseDate: new Date().toISOString().split('T')[0],
      developer: 'GameZone Community'
    };

    const updated = storageService.saveGame(gameToSave);
    onGamesUpdated(updated);
    setIsGameModalOpen(false);
  };

  // Toggle Admin Role
  const handleToggleAdminRole = () => {
    const nextRole: 'admin' | 'user' = currentUser.role === 'admin' ? 'user' : 'admin';
    const updated: UserProfile = { ...currentUser, role: nextRole };
    storageService.saveUser(updated);
    onUserUpdated(updated);
  };

  // Toggle Current User Premium
  const handleToggleUserPremium = () => {
    const updated = { ...currentUser, isPremium: !currentUser.isPremium };
    storageService.saveUser(updated);
    onUserUpdated(updated);
  };

  const filteredGames = games.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Analytics totals
  const totalPlays = games.reduce((acc, g) => acc + g.playersCount, 0);
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-2xl text-white">Admin Management Console</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage games catalog, user privileges, subscription revenues, and platform analytics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleAdminRole}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            Role: {currentUser.role === 'admin' ? 'Admin Mode (Active)' : 'User Mode (Click to Toggle)'}
          </button>
          <button
            onClick={handleOpenAddGame}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-400/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Game</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Games</span>
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-display font-black text-2xl text-white tabular-nums">{games.length}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Across 15 categories</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Sessions</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-display font-black text-2xl text-white tabular-nums">
            {(totalPlays / 1000).toFixed(1)}k
          </span>
          <span className="text-[11px] text-emerald-400 block mt-1">+14% this week</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Subscription Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-display font-black text-2xl text-white tabular-nums">
            ${totalRevenue.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">{payments.length} verified transactions</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Platform Status</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <span className="font-display font-black text-2xl text-cyan-400 tabular-nums">99.98%</span>
          <span className="text-[11px] text-slate-500 block mt-1">HTML5 Zero-Downtime</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('games')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'games'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Games Management ({games.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'users'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          User Accounts & Roles
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'subscriptions'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Billing & Payments ({payments.length})
        </button>
      </div>

      {/* TAB 1: Games Management */}
      {activeTab === 'games' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games by title or category..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleOpenAddGame}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Game</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Game</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Access Tier</th>
                  <th className="py-3 px-4">Engine</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredGames.map((game) => (
                  <tr key={game.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={game.thumbnail}
                          alt={game.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-8 rounded-lg object-cover border border-slate-700"
                        />
                        <div>
                          <span className="font-bold text-white block">{game.title}</span>
                          <span className="text-[11px] text-slate-500">{game.developer}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-cyan-400 font-medium">{game.category}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleGamePremium(game)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold ${
                          game.isPremium
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                        title="Click to toggle Free/Premium"
                      >
                        {game.isPremium ? <Crown className="w-3 h-3" /> : null}
                        <span>{game.isPremium ? 'Premium' : 'Free'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {game.engineType}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      ★ {game.rating} ({game.ratingCount})
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditGame(game)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Game Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGame(game.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Game"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="font-display font-bold text-lg text-white mb-4">User Profiles & Security</h3>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{currentUser.username}</span>
                  {currentUser.isPremium && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                      PRO
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">{currentUser.email}</span>
                <span className="text-[11px] text-slate-500 block">Member since {currentUser.joinedAt}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleUserPremium}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
              >
                {currentUser.isPremium ? 'Revoke PRO' : 'Grant PRO Membership'}
              </button>
              <button
                onClick={handleToggleAdminRole}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-colors"
              >
                Toggle Admin Rights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Subscriptions & Payment Records */}
      {activeTab === 'subscriptions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">Payment Transactions & Subscriptions</h3>
            <span className="text-xs text-slate-400">Total Volume: ${totalRevenue.toFixed(2)}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-cyan-400">{p.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{p.userName}</span>
                      <span className="text-[11px] text-slate-500">{p.userEmail}</span>
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold text-amber-300">{p.planId}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white tabular-nums">${p.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-400">{p.paymentMethod}</td>
                    <td className="py-3 px-4 text-slate-400">{p.date}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT GAME MODAL */}
      {isGameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-black text-xl text-white mb-4">
              {editingGameId ? 'Edit Game Information' : 'Add New Game to Catalog'}
            </h3>

            <form onSubmit={handleSaveGame} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Game Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Neon Horizon Racer"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief synopsis of gameplay mechanics..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as GameCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    {CATEGORIES_LIST.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Engine Type</label>
                  <select
                    value={formEngine}
                    onChange={(e) => setFormEngine(e.target.value as GameEngineType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="canvas-racer">3D Neon Highway Racer</option>
                    <option value="canvas-space-shooter">Space Defender Shooter</option>
                    <option value="canvas-penalty-shootout">Penalty Shootout Football</option>
                    <option value="canvas-basketball-3pt">Basketball 3-Point Clutch</option>
                    <option value="canvas-cyber-fusion">Cyber Fusion 2048</option>
                    <option value="canvas-brick-breaker">Neon Brick Breaker</option>
                    <option value="canvas-tactical-strike">Tactical Strike Combat</option>
                    <option value="canvas-memory-matrix">Synapse Memory Matrix</option>
                    <option value="embed">External Embed URL</option>
                  </select>
                </div>
              </div>

              {formEngine === 'embed' && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Game Embed URL</label>
                  <input
                    type="url"
                    value={formEmbedUrl}
                    onChange={(e) => setFormEmbedUrl(e.target.value)}
                    placeholder="https://example.com/game-embed"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={formThumbnail}
                  onChange={(e) => setFormThumbnail(e.target.value)}
                  placeholder="https://... or /src/assets/images/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="isPremiumCheck"
                  checked={formIsPremium}
                  onChange={(e) => setFormIsPremium(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="isPremiumCheck" className="text-slate-200 font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Lock as Premium Game (Requires active subscription)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGameModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md"
                >
                  Save Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
