import { Game, UserProfile, GameReview, LeaderboardEntry, PaymentRecord } from '../types/game';
import { INITIAL_GAMES } from '../data/initialGames';

const STORAGE_KEYS = {
  GAMES: 'gamezone_games_v1',
  USER: 'gamezone_current_user_v1',
  REVIEWS: 'gamezone_reviews_v1',
  LEADERBOARD: 'gamezone_leaderboard_v1',
  PAYMENTS: 'gamezone_payments_v1',
  THEME: 'gamezone_theme_v1'
};

const DEFAULT_USER: UserProfile = {
  id: 'usr-gamer-007',
  username: 'AlexRider_Pro',
  email: 'alex.rider@gamezone.pro',
  avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80',
  isPremium: false,
  premiumTier: null,
  premiumExpiresAt: null,
  role: 'user',
  joinedAt: '2026-03-14',
  favorites: ['game-cyber-racer-3d', 'game-cyber-fusion-2048'],
  history: [
    {
      gameId: 'game-cyber-racer-3d',
      gameTitle: 'Neon Drift: Tokyo Horizon 3D',
      playedAt: '2026-11-01T14:20:00Z',
      score: 18450
    },
    {
      gameId: 'game-cyber-fusion-2048',
      gameTitle: 'Cyber Fusion: Neon 2048',
      playedAt: '2026-10-28T19:45:00Z',
      score: 8192
    }
  ]
};

const INITIAL_REVIEWS: GameReview[] = [
  {
    id: 'rev-1',
    gameId: 'game-cyber-racer-3d',
    userId: 'usr-101',
    userName: 'Kaito_Viper',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    isPremium: true,
    rating: 5,
    comment: 'The drift physics and nitro trail sound effects are pure adrenaline! Smooth 60fps on browser.',
    createdAt: '2026-10-24'
  },
  {
    id: 'rev-2',
    gameId: 'game-cyber-racer-3d',
    userId: 'usr-102',
    userName: 'Sarah_Cyber',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    isPremium: false,
    rating: 5,
    comment: 'Best browser racer ever. Love how the traffic gets progressively tighter the longer you survive.',
    createdAt: '2026-10-27'
  },
  {
    id: 'rev-3',
    gameId: 'game-space-defender-arcade',
    userId: 'usr-103',
    userName: 'AstroNova',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    isPremium: true,
    rating: 5,
    comment: 'Classic shmup vibes with modern particle lasers. The boss battles on wave 5 are epic!',
    createdAt: '2026-10-29'
  },
  {
    id: 'rev-4',
    gameId: 'game-tactical-strike-prime',
    userId: 'usr-104',
    userName: 'GhostRecon_99',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    isPremium: true,
    rating: 5,
    comment: 'Definitely worth the GameZone Pro Premium membership. Stealth mechanics are top-tier.',
    createdAt: '2026-11-01'
  }
];

const INITIAL_LEADERBOARDS: LeaderboardEntry[] = [
  { id: 'lb-1', gameId: 'game-cyber-racer-3d', userId: 'u-1', userName: 'NitroPhantom', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', score: 48920, date: '2026-11-02' },
  { id: 'lb-2', gameId: 'game-cyber-racer-3d', userId: 'u-2', userName: 'TokyoVeloce', userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', score: 39400, date: '2026-11-01' },
  { id: 'lb-3', gameId: 'game-cyber-racer-3d', userId: 'u-3', userName: 'DriftKing_X', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', score: 31250, date: '2026-10-30' },
  { id: 'lb-4', gameId: 'game-space-defender-arcade', userId: 'u-4', userName: 'StarMarshal', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', score: 98400, date: '2026-11-02' },
  { id: 'lb-5', gameId: 'game-space-defender-arcade', userId: 'u-5', userName: 'VortexPilot', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', score: 76500, date: '2026-10-28' },
  { id: 'lb-6', gameId: 'game-cyber-fusion-2048', userId: 'u-6', userName: 'QuantumBrain', userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', score: 36840, date: '2026-11-02' }
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-tx-8941',
    userId: 'usr-101',
    userName: 'Kaito_Viper',
    userEmail: 'kaito@cyberzone.net',
    planId: 'yearly',
    amount: 79.99,
    date: '2026-10-15',
    status: 'completed',
    paymentMethod: 'Credit Card (••• 4242)',
    transactionRef: 'ch_3N82J9Kx9L0Pq'
  },
  {
    id: 'pay-tx-8942',
    userId: 'usr-104',
    userName: 'GhostRecon_99',
    userEmail: 'ghost@vanguard.io',
    planId: 'monthly',
    amount: 9.99,
    date: '2026-10-22',
    status: 'completed',
    paymentMethod: 'Google Pay',
    transactionRef: 'gpay_98319aa01'
  }
];

export const storageService = {
  getGames(): Game[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAMES);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    // Seed initial games
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(INITIAL_GAMES));
    return INITIAL_GAMES;
  },

  getGameById(id: string): Game | undefined {
    const games = this.getGames();
    return games.find(g => g.id === id || g.slug === id);
  },

  saveGame(game: Game): Game[] {
    const games = this.getGames();
    const index = games.findIndex(g => g.id === game.id);
    let updated: Game[];
    if (index >= 0) {
      updated = [...games];
      updated[index] = game;
    } else {
      updated = [game, ...games];
    }
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(updated));
    return updated;
  },

  deleteGame(id: string): Game[] {
    const games = this.getGames();
    const updated = games.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(updated));
    return updated;
  },

  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  },

  saveUser(user: UserProfile): UserProfile {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  toggleFavorite(gameId: string): string[] {
    const user = this.getUser();
    const exists = user.favorites.includes(gameId);
    const updatedFavorites = exists
      ? user.favorites.filter(id => id !== gameId)
      : [...user.favorites, gameId];
    
    user.favorites = updatedFavorites;
    this.saveUser(user);
    return updatedFavorites;
  },

  recordGamePlay(gameId: string, gameTitle: string, score?: number): UserProfile {
    const user = this.getUser();
    const now = new Date().toISOString();
    const existingIndex = user.history.findIndex(h => h.gameId === gameId);

    const newHistoryItem = {
      gameId,
      gameTitle,
      playedAt: now,
      score: score !== undefined ? score : (existingIndex >= 0 ? user.history[existingIndex].score : undefined)
    };

    const filtered = user.history.filter(h => h.gameId !== gameId);
    user.history = [newHistoryItem, ...filtered].slice(0, 30); // keep recent 30
    return this.saveUser(user);
  },

  getReviews(gameId?: string): GameReview[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      const reviews: GameReview[] = data ? JSON.parse(data) : INITIAL_REVIEWS;
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
      }
      return gameId ? reviews.filter(r => r.gameId === gameId) : reviews;
    } catch {
      return INITIAL_REVIEWS;
    }
  },

  addReview(newReview: Omit<GameReview, 'id' | 'createdAt'>): GameReview {
    const reviews = this.getReviews();
    const created: GameReview = {
      ...newReview,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [created, ...reviews];
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));

    // Update game rating statistics
    const games = this.getGames();
    const game = games.find(g => g.id === newReview.gameId);
    if (game) {
      const gameReviews = updated.filter(r => r.gameId === newReview.gameId);
      const avg = gameReviews.reduce((sum, r) => sum + r.rating, 0) / gameReviews.length;
      game.rating = Number(avg.toFixed(1));
      game.ratingCount = gameReviews.length + 10;
      this.saveGame(game);
    }

    return created;
  },

  getLeaderboard(gameId: string): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      const list: LeaderboardEntry[] = data ? JSON.parse(data) : INITIAL_LEADERBOARDS;
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(INITIAL_LEADERBOARDS));
      }
      return list
        .filter(entry => entry.gameId === gameId)
        .sort((a, b) => b.score - a.score)
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
    } catch {
      return [];
    }
  },

  submitScore(gameId: string, score: number): LeaderboardEntry[] {
    const user = this.getUser();
    const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    const list: LeaderboardEntry[] = data ? JSON.parse(data) : INITIAL_LEADERBOARDS;

    const entry: LeaderboardEntry = {
      id: `lb-${Date.now()}`,
      gameId,
      userId: user.id,
      userName: user.username,
      userAvatar: user.avatar,
      score,
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [...list, entry];
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updated));
    this.recordGamePlay(gameId, '', score);
    return this.getLeaderboard(gameId);
  },

  getPaymentRecords(): PaymentRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
    return INITIAL_PAYMENTS;
  },

  subscribeUser(tier: 'monthly' | 'yearly', paymentMethod: string): { user: UserProfile; payment: PaymentRecord } {
    const user = this.getUser();
    const amount = tier === 'yearly' ? 79.99 : 9.99;
    
    // Set expiry 30 days or 365 days in future
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (tier === 'yearly' ? 365 : 30));

    user.isPremium = true;
    user.premiumTier = tier;
    user.premiumExpiresAt = expiry.toISOString();
    this.saveUser(user);

    const payment: PaymentRecord = {
      id: `pay-tx-${Date.now()}`,
      userId: user.id,
      userName: user.username,
      userEmail: user.email,
      planId: tier,
      amount,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      paymentMethod,
      transactionRef: `sub_${Math.random().toString(36).substring(2, 11)}`
    };

    const payments = this.getPaymentRecords();
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([payment, ...payments]));

    return { user, payment };
  },

  cancelSubscription(): UserProfile {
    const user = this.getUser();
    user.isPremium = false;
    user.premiumTier = null;
    user.premiumExpiresAt = null;
    return this.saveUser(user);
  }
};
