import React, { useState } from 'react';
import { Trophy, Medal, Star, Play, Sparkles } from 'lucide-react';
import { Game } from '../types/game';
import { storageService } from '../services/storageService';

interface LeaderboardsPageProps {
  games: Game[];
  onPlayGame: (game: Game) => void;
}

export const LeaderboardsPage: React.FC<LeaderboardsPageProps> = ({
  games,
  onPlayGame
}) => {
  const [selectedGameId, setSelectedGameId] = useState(games[0]?.id || '');
  const selectedGame = games.find(g => g.id === selectedGameId) || games[0];
  const leaderboard = selectedGame ? storageService.getLeaderboard(selectedGame.id) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
          <Trophy className="w-3.5 h-3.5 fill-current" />
          <span>GLOBAL HALL OF FAME</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white dark:text-white text-slate-900 tracking-tight">
          Champions & Top High Scores
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-500 mt-2">
          Real-time global scores recorded by players across every browser title.
        </p>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {games.map(game => (
          <button
            key={game.id}
            onClick={() => setSelectedGameId(game.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-all ${
              selectedGameId === game.id
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-md'
                : 'bg-slate-900/60 dark:bg-slate-900/60 bg-white border-slate-800 dark:border-slate-800 border-slate-200 text-slate-400 hover:text-white'
            }`}
          >
            <img src={game.thumbnail} alt="" className="w-5 h-5 rounded object-cover" />
            <span>{game.title}</span>
          </button>
        ))}
      </div>

      {/* Main Selected Game Leaderboard Podium & Table */}
      {selectedGame && (
        <div className="bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 dark:border-slate-800/80 border-slate-200/80 mb-6">
            <div className="flex items-center gap-4">
              <img
                src={selectedGame.thumbnail}
                alt={selectedGame.title}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-700"
              />
              <div>
                <span className="text-xs text-cyan-400 font-semibold">{selectedGame.category}</span>
                <h2 className="font-display font-extrabold text-xl text-white dark:text-white text-slate-900">
                  {selectedGame.title}
                </h2>
                <span className="text-xs text-slate-400">
                  ★ {selectedGame.rating} ({selectedGame.playersCount.toLocaleString()} players)
                </span>
              </div>
            </div>

            <button
              onClick={() => onPlayGame(selectedGame)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play to Beat Score</span>
            </button>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No recorded entries yet. Click Play to set the first world record!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 dark:bg-slate-950/60 bg-slate-100 text-slate-400 font-semibold border-b border-slate-800 dark:border-slate-800 border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4 text-right">Date Achieved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 dark:divide-slate-800/60 divide-slate-200">
                  {leaderboard.map((entry, idx) => (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {idx === 0 ? (
                            <Medal className="w-5 h-5 text-amber-400" />
                          ) : idx === 1 ? (
                            <Medal className="w-5 h-5 text-slate-300" />
                          ) : idx === 2 ? (
                            <Medal className="w-5 h-5 text-amber-600" />
                          ) : (
                            <span className="font-mono text-slate-500 font-bold ml-1.5">#{idx + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.userAvatar}
                            alt={entry.userName}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                          />
                          <span className="font-bold text-white dark:text-white text-slate-900">{entry.userName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-cyan-400 dark:text-cyan-400 text-cyan-600 text-sm tabular-nums">
                          {entry.score.toLocaleString()} PTS
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono">
                        {entry.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
