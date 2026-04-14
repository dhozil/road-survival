import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Users } from 'lucide-react';

const GameStats = ({ stats }) => {
  return (
    <motion.div 
      className="panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-lg font-bold text-gray-800 mb-4">Game Statistics</h2>
      
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="text-2xl font-bold text-primary-600">
            {stats.totalGames.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 mt-1">Total Games</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="text-2xl font-bold text-secondary-600">
            {stats.activePlayers.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 mt-1">Active Players</div>
        </motion.div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-center text-xs text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Gamepad2 className="w-3 h-3" />
            <span>Live Statistics</span>
          </div>
          <p>Updated every 10 seconds</p>
        </div>
      </div>
    </motion.div>
  );
};

export default GameStats;
export { GameStats };
