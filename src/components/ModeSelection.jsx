import React from 'react';
import { motion } from 'framer-motion';
import { Users, Gamepad2, Trophy, Star } from 'lucide-react';
import { WalletConnect } from './WalletConnect';

const ModeSelection = ({ onSelectMode, onWalletConnected, onWalletDisconnected, isWalletConnected, soloLeaderboard, leaderboard }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex flex-col p-4">
      {/* Header with Wallet Connect */}
      <motion.div 
        className="flex justify-between items-center mb-8 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div></div>
        <div className="z-20 transform scale-75" style={{ width: '453px', height: '189px' }}>
          <WalletConnect
            onWalletConnected={onWalletConnected}
            onWalletDisconnected={onWalletDisconnected}
          />
        </div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center">
        <motion.div 
          className="max-w-6xl w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl font-bold text-white mb-4 font-game">
              🏎️ ROAD SURVIVAL
            </h1>
            <p className="text-xl text-white/80">
              Choose your racing mode
            </p>
          </motion.div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Solo Mode Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => onSelectMode('solo')}
              className="w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20 hover:border-yellow-400 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  🎯 Solo Game
                </h2>
                <p className="text-white/70 mb-6">
                  Race against time and beat your own records
                </p>
                <div className="space-y-2 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Practice your skills
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Beat personal bests
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Solo leaderboard
                  </div>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Multiplayer Mode Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => onSelectMode('multiplayer')}
              className="w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20 hover:border-blue-400 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  🎮 Multiplayer
                </h2>
                <p className="text-white/70 mb-6">
                  Compete against players worldwide
                </p>
                <div className="space-y-2 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-400" />
                    Real-time racing
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-400" />
                    Create or join rooms
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-400" />
                    Global leaderboard
                  </div>
                </div>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Leaderboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Solo Leaderboard */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              🏆 Solo Leaderboard
            </h3>
            <div className="space-y-2">
              {soloLeaderboard && soloLeaderboard.length > 0 ? (
                soloLeaderboard.slice(0, 5).map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-yellow-400">#{entry.rank}</span>
                      <span className="text-white font-semibold">{entry.name}</span>
                    </div>
                    <span className="text-white font-bold">{entry.score.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-white/50 text-center py-4">No scores yet</p>
              )}
            </div>
          </div>

          {/* Multiplayer Leaderboard */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-blue-400" />
              🏆 Multiplayer Leaderboard
            </h3>
            <div className="space-y-2">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.slice(0, 5).map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-blue-400">#{entry.rank}</span>
                      <span className="text-white font-semibold">{entry.name}</span>
                    </div>
                    <span className="text-white font-bold">{entry.score.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-white/50 text-center py-4">No scores yet</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-12 text-white/50 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>Powered by GenLayer Blockchain</p>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
};

export default ModeSelection;
export { ModeSelection };
