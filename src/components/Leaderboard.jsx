import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Star } from 'lucide-react';

const Leaderboard = ({ data, title = "Leaderboard" }) => {
  const getRankIcon = (rank) => {
    switch(rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Star className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-gray-600 font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 1:
        return 'text-yellow-600 font-bold';
      case 2:
        return 'text-gray-600 font-bold';
      case 3:
        return 'text-orange-600 font-bold';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <motion.div 
      className="panel"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Leaderboard
      </h2>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No scores yet</p>
          <p className="text-sm">Be the first to play!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.map((entry, index) => (
            <motion.div
              key={`${entry.name}-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="leaderboard-item"
            >
              <div className="flex items-center gap-3">
                {getRankIcon(entry.rank || index + 1)}
                <div className="flex-1">
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>
                    {entry.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg ${getRankColor(entry.rank || index + 1)}`}>
                    {entry.score?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>Top {data.length} Players</p>
            <p className="text-xs mt-1">Updated in real-time</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Leaderboard;
export { Leaderboard };
