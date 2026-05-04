import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Crown, Medal, Star, Home } from 'lucide-react';

const GameOver = ({ gameMode, gameResult, finalScore, isSubmitting, onPlayAgain, onBackToLobby }) => {
  console.log("GameOver component rendering", { gameMode, gameResult, finalScore, isSubmitting });
  
  const getRankIcon = (rank) => {
    switch(rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Star className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-2xl font-bold text-gray-600">#{rank}</span>;
    }
  };

  return (
    <motion.div 
      className="game-canvas"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        {/* Game Over Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-4xl font-bold text-white mb-2 font-game">
            🏁 GAME OVER
          </h2>
        </motion.div>

        {/* Game Result */}
        {gameResult ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="text-yellow-400 text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8" />
              Winner: {gameResult.winner}
            </div>
            
            <div className="space-y-2">
              {gameResult.players?.map((player, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    {getRankIcon(index + 1)}
                    <span className="text-white font-semibold">{player.name}</span>
                  </div>
                  <span className="text-white font-bold">{player.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="text-white text-xl mb-2">
              {gameMode === 'solo' ? '🎯 Solo Practice Completed!' : '🏁 Your Score'}
            </div>
            <div className="text-4xl font-bold text-yellow-400 font-game">
              {finalScore.toLocaleString()}
            </div>
          </motion.div>
        )}

        {/* Submit Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3 text-white/80">
              <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full"></div>
              <span>⛓️ Save Score to Genlayer...</span>
            </div>
          ) : (
            <div className="text-green-400 font-semibold flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              ✅ Score saved
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 justify-center"
        >
          <button
            onClick={onBackToLobby}
            className="game-button bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 px-6 py-3 text-lg"
          >
            <Home className="w-5 h-5 inline mr-2" />
            🏠 Lobby
          </button>
          <button
            onClick={onPlayAgain}
            className="game-button bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-6 py-3 text-lg"
          >
            <RotateCcw className="w-5 h-5 inline mr-2" />
            🔄 Play Again
          </button>
        </motion.div>

        {/* Game Mode Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-white/60 text-sm"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="font-semibold mb-1">
              {gameMode === 'solo' ? '🎯 Solo Mode' : '🎮 Multiplayer Mode'}
            </div>
            <div className="text-xs">
              {gameMode === 'solo' 
                ? '' 
                : 'Compete against other players'
              }
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GameOver;
export { GameOver };
