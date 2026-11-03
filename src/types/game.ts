export type GameCategory =
  | 'Action'
  | 'Racing'
  | 'Car'
  | 'Shooting'
  | 'Puzzle'
  | 'Adventure'
  | 'Arcade'
  | 'Sports'
  | 'Football'
  | 'Basketball'
  | 'Strategy'
  | 'Multiplayer'
  | 'Brain'
  | 'Casual'
  | '3D';

export type GameEngineType =
  | 'canvas-racer'
  | 'canvas-space-shooter'
  | 'canvas-penalty-shootout'
  | 'canvas-basketball-3pt'
  | 'canvas-cyber-fusion'
  | 'canvas-brick-breaker'
  | 'canvas-tactical-strike'
  | 'canvas-memory-matrix'
  | 'embed';

export interface GameControl {
  key: string;
  action: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: GameCategory;
  secondaryCategories: GameCategory[];
  thumbnail: string;
  isPremium: boolean;
  rating: number;
  ratingCount: number;
  playersCount: number;
  trending?: boolean;
  popular?: boolean;
  recommended?: boolean;
  featured?: boolean;
  tags: string[];
  engineType: GameEngineType;
  embedUrl?: string;
  instructions: string[];
  controls: GameControl[];
  releaseDate: string;
  developer: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  isPremium: boolean;
  premiumTier?: 'monthly' | 'yearly' | null;
  premiumExpiresAt?: string | null;
  role: 'user' | 'admin';
  joinedAt: string;
  favorites: string[];
  history: {
    gameId: string;
    gameTitle: string;
    playedAt: string;
    score?: number;
  }[];
}

export interface GameReview {
  id: string;
  gameId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  isPremium: boolean;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  gameId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  score: number;
  date: string;
  rank?: number;
}

export interface SubscriptionPlan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number;
  billingPeriod: string;
  badge?: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: 'monthly' | 'yearly';
  amount: number;
  date: string;
  status: 'completed' | 'refunded' | 'failed';
  paymentMethod: string;
  transactionRef: string;
}
