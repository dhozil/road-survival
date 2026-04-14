import React from 'react';
import { motion } from 'framer-motion';
import { Users, Gamepad2, Plus, LogIn, Play, Square } from 'lucide-react';

const GameControls = ({
  playerName,
  setPlayerName,
  gameMode,
  setGameMode,
  roomInput,
  setRoomInput,
  onCreateRoom,
  onJoinRoom,
  onStartSolo,
  onEndSession,
  status,
  screen
}) => {
  return (
    <motion.div 
      className="panel"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Gamepad2 className="w-5 h-5" />
        Game Controls
      </h2>
      
      {/* Player Name */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Player Name
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          maxLength={20}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
          disabled={screen !== 'lobby'}
        />
      </div>

      {/* Game Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Game Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`mode-button ${gameMode === 'multiplayer' ? 'active' : ''}`}
            onClick={() => setGameMode('multiplayer')}
            disabled={screen !== 'lobby'}
          >
            <Users className="w-4 h-4 mx-auto mb-1" />
            Multiplayer
          </button>
          <button
            className={`mode-button ${gameMode === 'solo' ? 'active' : ''}`}
            onClick={() => setGameMode('solo')}
            disabled={screen !== 'lobby'}
          >
            <Play className="w-4 h-4 mx-auto mb-1" />
            Solo Game
          </button>
        </div>
      </div>

      {/* Multiplayer Controls */}
      {gameMode === 'multiplayer' && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <button
            onClick={onCreateRoom}
            disabled={screen !== 'lobby' || !playerName.trim()}
            className="game-button bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 w-full"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Room
          </button>
          
          <input
            type="text"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="Enter Room ID"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            disabled={screen !== 'lobby'}
          />
          
          <button
            onClick={onJoinRoom}
            disabled={screen !== 'lobby' || !playerName.trim() || !roomInput.trim()}
            className="game-button bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 w-full"
          >
            <LogIn className="w-4 h-4 inline mr-2" />
            Join Room
          </button>
        </motion.div>
      )}

      {/* Solo Controls */}
      {gameMode === 'solo' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <button
            onClick={onStartSolo}
            disabled={screen !== 'lobby' || !playerName.trim()}
            className="game-button bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 w-full"
          >
            <Play className="w-4 h-4 inline mr-2" />
            Start Solo Game
          </button>
          
          {/* End Session Button - Only show when playing */}
          {screen === 'playing' && (
            <button
              onClick={onEndSession}
              className="game-button bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 w-full mt-3"
            >
              <Square className="w-4 h-4 inline mr-2" />
              End Session
            </button>
          )}
        </motion.div>
      )}

      {/* Status Message */}
      {status.message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`status-message status-${status.type} mt-4`}
        >
          {status.message}
        </motion.div>
      )}
    </motion.div>
  );
};

export default GameControls;
export { GameControls };
