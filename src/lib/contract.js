import { client } from "./genlayer";

const CONTRACT_ADDRESS = "0x3c4d0D3d7f925Ec451bd720c44F8679cE0efAb7F";

// ==================== BASIC GAME FUNCTIONS ====================

export async function submitScore(sessionId, playerName, score) {
  try {
    const res = await client.write({
      contract: CONTRACT_ADDRESS,
      method: "submit_score",
      args: [sessionId, playerName, score],
    });

    console.log("✅ Score submitted:", res);
  } catch (err) {
    console.error("❌ Submit score error:", err);
  }
}

export async function getLeaderboard() {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "get_leaderboard",
      args: [],
    });

    return res;
  } catch (err) {
    console.error("❌ Leaderboard error:", err);
    return [];
  }
}

// ==================== INTEGRAL GENLAYER FUNCTIONS ====================
// These functions make GenLayer features REQUIRED for core gameplay

// AI Anti-Cheat Score Submission (CRITICAL - uses LLM consensus)
export async function submitScoreIntelligent(sessionId, playerName, score, gameTime, moves) {
  try {
    const res = await client.write({
      contract: CONTRACT_ADDRESS,
      method: "submit_score_intelligent",
      args: [sessionId, playerName, score, gameTime, moves],
    });

    console.log("✅ Score submitted with AI validation:", res);
    return res;
  } catch (err) {
    console.error("❌ Intelligent score submission error:", err);
    throw err;
  }
}

// Update Game Difficulty using AI + Real Weather (CRITICAL - affects gameplay)
export async function updateGameDifficulty(city) {
  try {
    const res = await client.write({
      contract: CONTRACT_ADDRESS,
      method: "update_game_difficulty",
      args: [city],
    });

    console.log("✅ Game difficulty updated with AI + weather:", res);
    return res;
  } catch (err) {
    console.error("❌ Update difficulty error:", err);
    throw err;
  }
}

// Get Current Difficulty (after AI calculation)
export async function getCurrentDifficulty() {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "get_current_difficulty",
      args: [],
    });

    return res;
  } catch (err) {
    console.error("❌ Get difficulty error:", err);
    return "1.0";
  }
}

// Get Weather Speed Multiplier (affects car speed)
export async function getGameSpeedMultiplier() {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "get_game_speed_multiplier",
      args: [],
    });

    return res;
  } catch (err) {
    console.error("❌ Get speed multiplier error:", err);
    return "1.0";
  }
}

// Get Current Weather
export async function getCurrentWeather() {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "get_current_weather",
      args: [],
    });

    return res;
  } catch (err) {
    console.error("❌ Get weather error:", err);
    return "sunny";
  }
}

// Generate Enemy Pattern using LLM (CRITICAL - required for enemies)
export async function generateEnemyPatternForSession(sessionId, playerSkill) {
  try {
    const res = await client.write({
      contract: CONTRACT_ADDRESS,
      method: "generate_enemy_pattern_for_session",
      args: [sessionId, playerSkill],
    });

    console.log("✅ Enemy pattern generated with AI:", res);
    return res;
  } catch (err) {
    console.error("❌ Generate enemy pattern error:", err);
    throw err;
  }
}

// Get AI-Generated Enemy Pattern
export async function getEnemyPattern(sessionId) {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "get_enemy_pattern",
      args: [sessionId],
    });

    return res;
  } catch (err) {
    console.error("❌ Get enemy pattern error:", err);
    return "";
  }
}

// Get Complete Intelligent Game State
export async function getIntelligentGameState() {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "get_intelligent_game_state",
      args: [],
    });

    return res;
  } catch (err) {
    console.error("❌ Get intelligent game state error:", err);
    return {
      weather: "sunny",
      weather_multiplier: "1.0",
      difficulty: "1.0",
      enemy_pattern_available: false,
      ai_commentary_count: 0
    };
  }
}

// ==================== AI CONTENT GENERATION ====================

export async function generateCarDescription(carType) {
  try {
    const res = await client.write({
      contract: CONTRACT_ADDRESS,
      method: "generate_car_description",
      args: [carType],
    });

    console.log("✅ Car description generated:", res);
    return res;
  } catch (err) {
    console.error("❌ Generate car description error:", err);
    throw err;
  }
}

export async function getCarDescription(carType) {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "get_car_description",
      args: [carType],
    });

    return res;
  } catch (err) {
    console.error("❌ Get car description error:", err);
    return "";
  }
}

export async function generateAICommentary(playerName, score, action) {
  try {
    const res = await client.write({
      contract: CONTRACT_ADDRESS,
      method: "generate_ai_commentary",
      args: [playerName, score, action],
    });

    console.log("✅ AI commentary generated:", res);
    return res;
  } catch (err) {
    console.error("❌ Generate AI commentary error:", err);
    throw err;
  }
}

export async function getAICommentary(playerName) {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "get_ai_commentary",
      args: [playerName],
    });

    return res;
  } catch (err) {
    console.error("❌ Get AI commentary error:", err);
    return "";
  }
}

// ==================== WEATHER & CAR STATS ====================

export async function fetchWeatherConditions(city) {
  try {
    const res = await client.write({
      contract: CONTRACT_ADDRESS,
      method: "fetch_weather_conditions",
      args: [city],
    });

    console.log("✅ Weather conditions fetched:", res);
    return res;
  } catch (err) {
    console.error("❌ Fetch weather error:", err);
    throw err;
  }
}

export async function getWeatherConditions(city) {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "get_weather_conditions",
      args: [city],
    });

    return res;
  } catch (err) {
    console.error("❌ Get weather error:", err);
    return "sunny+20°C";
  }
}

export async function fetchCarStats(carModel) {
  try {
    const res = await client.write({
      contract: CONTRACT_ADDRESS,
      method: "fetch_car_stats",
      args: [carModel],
    });

    console.log("✅ Car stats fetched:", res);
    return res;
  } catch (err) {
    console.error("❌ Fetch car stats error:", err);
    throw err;
  }
}

// ==================== EQUIVALENCE PRINCIPLE ====================

export async function calculateGameDifficulty(score, weather) {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "calculate_game_difficulty",
      args: [score, weather],
    });

    return res;
  } catch (err) {
    console.error("❌ Calculate difficulty error:", err);
    return "1.0";
  }
}

export async function validateScoreFairness(playerName, score, gameTime) {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "validate_score_fairness",
      args: [playerName, score, gameTime],
    });

    return res;
  } catch (err) {
    console.error("❌ Validate score error:", err);
    return "invalid:error";
  }
}

export async function getGameRecommendation(playerScore) {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "get_game_recommendation",
      args: [playerScore],
    });

    return res;
  } catch (err) {
    console.error("❌ Get recommendation error:", err);
    return "";
  }
}

export async function getCarPerformance(carType) {
  try {
    const res = await client.read({
      contract: CONTRACT_ADDRESS,
      method: "get_car_performance",
      args: [carType],
    });

    return res;
  } catch (err) {
    console.error("❌ Get car performance error:", err);
    return "unknown:50:50:50";
  }
}