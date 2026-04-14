import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Car as CarIcon, MessageSquare, Gauge, Sparkles, Globe } from 'lucide-react';

const GenLayerFeatures = ({
  weatherData,
  carDescription,
  aiCommentary,
  gameDifficulty,
  gameRecommendation,
  cityInput,
  setCityInput,
  carTypeInput,
  setCarTypeInput,
  fetchWeather,
  generateCarDescription,
  getRecommendation,
  isWalletConnected
}) => {
  return (
    <motion.div 
      className="panel"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        GenLayer AI Features
      </h2>

      {/* Weather Fetching - Web Fetching */}
      <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-blue-500" />
          Weather Data (Web Fetching)
        </h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="City name (e.g., Jakarta)"
            className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
          <button
            onClick={fetchWeather}
            disabled={!isWalletConnected}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
        {weatherData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-700 font-medium"
          >
            🌤️ {weatherData}
          </motion.div>
        )}
      </div>

      {/* LLM Car Description */}
      <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <CarIcon className="w-4 h-4 text-purple-500" />
          AI Car Description (LLM)
        </h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={carTypeInput}
            onChange={(e) => setCarTypeInput(e.target.value)}
            placeholder="Car type (e.g., sports, muscle)"
            className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
          <button
            onClick={generateCarDescription}
            disabled={!isWalletConnected}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
        {carDescription && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-700 italic"
          >
            "{carDescription}"
          </motion.div>
        )}
      </div>

      {/* AI Commentary */}
      {aiCommentary && (
        <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-500" />
            AI Commentary
          </h3>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-700 italic"
          >
            "{aiCommentary}"
          </motion.div>
        </div>
      )}

      {/* Game Difficulty - Equivalence Principle */}
      <div className="mb-6 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-orange-500" />
          Game Difficulty (Equivalence Principle)
        </h3>
        <div className="text-2xl font-bold text-orange-600">
          {gameDifficulty}x
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Calculated based on score & weather conditions
        </p>
      </div>

      {/* Game Recommendation */}
      <div className="mb-6 p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-500" />
          AI Recommendation
        </h3>
        <button
          onClick={getRecommendation}
          disabled={!isWalletConnected}
          className="w-full px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2"
        >
          Get Recommendation
        </button>
        {gameRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-700 font-medium"
          >
            💡 {gameRecommendation}
          </motion.div>
        )}
      </div>

      {/* Info Banner */}
      <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
        <p className="text-xs text-white text-center font-medium">
          🤖 Powered by GenLayer LLM & Web Fetching
        </p>
      </div>
    </motion.div>
  );
};

export default GenLayerFeatures;
