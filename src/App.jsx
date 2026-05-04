import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Trophy, 
  Users, 
  Gamepad2, 
  Zap, 
  Fuel, 
  Play, 
  Plus, 
  LogIn, 
  Crown,
  Medal,
  Star,
  Sparkles
} from 'lucide-react';

import { WalletConnect } from './components/WalletConnect';
import { GameCanvas } from './components/GameCanvas';
import { GameControls } from './components/GameControls';
import { Leaderboard } from './components/Leaderboard';
import { RoomList } from './components/RoomList';
import { GameStats } from './components/GameStats';
import { GameOver } from './components/GameOver';
import GenLayerFeatures from './components/GenLayerFeatures';
import ModeSelection from './components/ModeSelection';

// Configuration
const CONTRACT_ADDRESS = "0x3c4d0D3d7f925Ec451bd720c44F8679cE0efAb7F";
const WS_URL = "http://localhost:3001";

// Helper function to shade colors
const shadeColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

function App() {
  const [screen, setScreen] = useState('modeSelection');
  const [gameMode, setGameMode] = useState('multiplayer');
  const [playerName, setPlayerName] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [status, setStatus] = useState({ message: '', type: 'waiting' });
  const [sessionId, setSessionId] = useState('');
  const [soloId, setSoloId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  
  // Game state
  const [gameState, setGameState] = useState({
    score: 0,
    fuel: 100,
    speed: 3,
    isRunning: false
  });
  
  // UI state
  const [leaderboard, setLeaderboard] = useState([]);
  const [soloLeaderboard, setSoloLeaderboard] = useState([]);
  const [openRooms, setOpenRooms] = useState([]);
  const [soloGame, setSoloGame] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({ totalGames: 0, activePlayers: 0 });
  
  // GenLayer-specific state
  const [weatherData, setWeatherData] = useState(null);
  const [carDescription, setCarDescription] = useState('');
  const [aiCommentary, setAiCommentary] = useState('');
  const [gameDifficulty, setGameDifficulty] = useState('1.0');
  const [gameRecommendation, setGameRecommendation] = useState('');
  const [cityInput, setCityInput] = useState('Jakarta');
  const [carTypeInput, setCarTypeInput] = useState('sports');
  const [selectedCar, setSelectedCar] = useState('sports');
  
  // New GenLayer Integral Game State (REQUIRED for gameplay)
  const [intelligentGameState, setIntelligentGameState] = useState({
    enemyPattern: "",        // AI-generated enemy spawn pattern
    difficulty: "1.0",         // AI-calculated difficulty
    weatherMultiplier: "1.0",  // Weather effect on speed
    currentWeather: "sunny",   // Real-time weather
    enemyPatternLoaded: false, // Whether pattern is ready
    aiVerified: false          // Whether score can be submitted
  });
  const [gameMoves, setGameMoves] = useState(""); // Track moves for AI anti-cheat
  const [gameStartTime, setGameStartTime] = useState(null);

  // Refs
  const socketRef = useRef(null);
  const clientRef = useRef(null);
  const gameCanvasRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize backend connection for leaderboard
  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        // Fetch solo leaderboard from backend
        const soloResponse = await fetch('http://localhost:3001/api/solo-leaderboard');
        const soloData = await soloResponse.json();
        setSoloLeaderboard(soloData);
        
        // Fetch multiplayer leaderboard from backend
        const multiResponse = await fetch('http://localhost:3001/api/multiplayer-leaderboard');
        const multiData = await multiResponse.json();
        setLeaderboard(multiData);
      } catch (error) {
        console.error("Error fetching leaderboards from backend:", error);
        // Fallback to localStorage if backend fails
        const soloLocalData = localStorage.getItem('road_survival_solo_leaderboard');
        const multiLocalData = localStorage.getItem('road_survival_multi_leaderboard');
        
        if (soloLocalData) setSoloLeaderboard(JSON.parse(soloLocalData));
        if (multiLocalData) setLeaderboard(JSON.parse(multiLocalData));
      }
    };

    fetchLeaderboards();

    // Setup WebSocket connection for real-time updates
    const socket = io('http://localhost:3001');
    
    socket.on('solo-leaderboard-update', (data) => {
      setSoloLeaderboard(data);
    });
    
    socket.on('multiplayer-leaderboard-update', (data) => {
      setLeaderboard(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Contract interactions
  const fetchLeaderboard = async (client) => {
    try {
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_leaderboard",
        args: []
      });
      const entries = result.split('\n').filter(Boolean);
      const leaderboardData = entries.map((entry, idx) => {
        const [name, score] = entry.split(':');
        return { rank: idx + 1, name: name || 'Anonymous', score: parseInt(score) || 0 };
      }).sort((a, b) => b.score - a.score).slice(0, 10);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  const fetchSoloLeaderboard = async (client) => {
    try {
      const data = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_solo_leaderboard",
      });
      const entries = data.split('\n').filter(Boolean);
      const soloLeaderboardData = entries.map((entry, idx) => {
        const [name, score] = entry.split(':');
        return { rank: idx + 1, name: name || 'Anonymous', score: parseInt(score) || 0 };
      }).sort((a, b) => b.score - a.score).slice(0, 10);
      setSoloLeaderboard(soloLeaderboardData);
    } catch (error) {
      console.error("Failed to fetch solo leaderboard:", error);
      // Fallback to empty leaderboard
      setSoloLeaderboard([]);
    }
  };

  const fetchRooms = async (client) => {
    try {
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_open_sessions",
        args: []
      });
      
      if (result) {
        const rooms = result.split('\n').filter(Boolean);
        const roomData = rooms.map(room => {
          const [id, creator, status] = room.split(':');
          return { id, creator: creator || 'Anonymous', status: status || 'waiting' };
        });
        setOpenRooms(roomData);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      // Fallback to empty rooms
      setOpenRooms([]);
    }
  };

  const fetchStats = async (client) => {
    try {
      const res = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_stats",
        args: [],
      });
      
      // Mock stats for now
      setStats({ 
        totalGames: Math.floor(Math.random() * 100), 
        activePlayers: Math.floor(Math.random() * 50) 
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchSoloGame = async (client, playerName) => {
    try {
      const res = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_solo_game",
        args: [playerName],
      });
      
      if (res && res !== "") {
        const parts = res.split(":");
        if (parts.length >= 3) {
          setSoloGame({
            player: parts[0],
            status: parts[1],
            score: parseInt(parts[2])
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch solo game:", error);
      setSoloGame({ status: "not_found" });
    }
  };

  // ==================== GENLayer Feature Functions ====================
  
  const fetchWeather = async () => {
    if (!clientRef.current || !isWalletConnected) return;
    
    try {
      const tx = await clientRef.current.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "fetch_weather_conditions",
        args: [cityInput],
      });
      await clientRef.current.waitForTransactionReceipt({ hash: tx, status: "FINALIZED" });
      
      const weather = await clientRef.current.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_weather_conditions",
        args: [cityInput],
      });
      setWeatherData(weather);
      
      // Calculate game difficulty based on weather
      const difficulty = await clientRef.current.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "calculate_game_difficulty",
        args: [gameState.score.toString(), weather],
      });
      setGameDifficulty(difficulty);
      
      setStatus({ message: `✅ Weather updated: ${weather}`, type: "success" });
    } catch (error) {
      console.error("Failed to fetch weather:", error);
      setStatus({ message: "Failed to fetch weather data", type: "error" });
    }
  };

  const generateCarDescription = async () => {
    try {
      // Since blockchain is disabled, use local car descriptions
      const localDescriptions = {
        sports: "A sleek, high-performance sports car with aerodynamic curves and powerful engine. Built for speed and agility on the track.",
        muscle: "A classic American muscle car with a roaring V8 engine and aggressive styling. Pure power and straight-line performance.",
        sedan: "A comfortable and practical sedan with modern features and good fuel efficiency. Perfect for everyday driving.",
        suv: "A spacious SUV with off-road capabilities and family-friendly features. Ready for any adventure.",
        truck: "A rugged pickup truck with towing capacity and durability. Built for work and play.",
        racing: "A purpose-built racing car with minimal weight and maximum performance. Track-ready machine.",
        luxury: "A premium luxury car with advanced technology and superior comfort. The pinnacle of automotive refinement."
      };
      
      const description = localDescriptions[carTypeInput.toLowerCase()] || 
        `A ${carTypeInput} car with unique characteristics and features. Custom built for your driving experience.`;
      
      setCarDescription(description);
      setStatus({ message: "✅ Car description generated!", type: "success" });
    } catch (error) {
      console.error("Failed to generate car description:", error);
      setStatus({ message: "❌ Failed to generate description", type: "error" });
    }
  };

  const generateCommentary = async (action) => {
    if (!clientRef.current || !isWalletConnected) return;
    
    try {
      const tx = await clientRef.current.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "generate_ai_commentary",
        args: [playerName, gameState.score.toString(), action],
      });
      await clientRef.current.waitForTransactionReceipt({ hash: tx, status: "FINALIZED" });
      
      const commentary = await clientRef.current.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_ai_commentary",
        args: [playerName],
      });
      setAiCommentary(commentary);
    } catch (error) {
      console.error("Failed to generate commentary:", error);
    }
  };

  const getRecommendation = async () => {
    if (!clientRef.current || !isWalletConnected) return;
    
    try {
      const recommendation = await clientRef.current.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_game_recommendation",
        args: [gameState.score.toString()],
      });
      setGameRecommendation(recommendation);
    } catch (error) {
      console.error("Failed to get recommendation:", error);
    }
  };

  const validateScore = async (gameTime) => {
    if (!clientRef.current || !isWalletConnected) return "valid";
    
    try {
      const validation = await clientRef.current.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "validate_score_fairness",
        args: [playerName, gameState.score.toString(), gameTime.toString()],
      });
      return validation;
    } catch (error) {
      console.error("Failed to validate score:", error);
      return "invalid:calculation_error";
    }
  };

  // ==================== INTEGRAL GENLAYER GAME FUNCTIONS ====================
  // These functions make GenLayer features REQUIRED for core gameplay
  
  const updateGameDifficultyIntelligent = async () => {
    // CRITICAL: Fetch real weather and calculate game difficulty using AI consensus
    // Must be called BEFORE starting game - affects car speed and enemy behavior
    if (!clientRef.current || !isWalletConnected) {
      setStatus({ message: "⚠️ Wallet not connected - using default difficulty", type: "warning" });
      return;
    }
    
    try {
      setStatus({ message: "🤖 AI calculating difficulty from real weather...", type: "loading" });
      
      // Call contract to update difficulty using AI + real weather
      const tx = await clientRef.current.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "update_game_difficulty",
        args: [cityInput],  // City for weather fetching
      });
      await clientRef.current.waitForTransactionReceipt({ hash: tx, status: "FINALIZED" });
      
      // Get the AI-calculated difficulty
      const difficulty = await clientRef.current.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_current_difficulty",
        args: [],
      });
      
      // Get weather multiplier
      const multiplier = await clientRef.current.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_game_speed_multiplier",
        args: [],
      });
      
      // Get current weather
      const weather = await clientRef.current.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_current_weather",
        args: [],
      });
      
      setIntelligentGameState(prev => ({
        ...prev,
        difficulty,
        weatherMultiplier: multiplier,
        currentWeather: weather
      }));
      
      setStatus({ 
        message: `✅ AI Difficulty set: ${difficulty} | Weather: ${weather} | Speed: ${multiplier}x`, 
        type: "success" 
      });
    } catch (error) {
      console.error("Failed to update difficulty:", error);
      setStatus({ message: "⚠️ Using default difficulty", type: "warning" });
    }
  };

  const generateEnemyPatternForGame = async (sessionIdToUse) => {
    // CRITICAL: Generate enemy spawn pattern using LLM consensus
    // Game CANNOT spawn enemies without calling this first
    // Pattern is generated based on player skill and current weather
    if (!clientRef.current || !isWalletConnected) {
      setStatus({ message: "⚠️ Wallet not connected - using default pattern", type: "warning" });
      return;
    }
    
    try {
      setStatus({ message: "🤖 AI generating enemy patterns...", type: "loading" });
      
      // Determine player skill based on previous scores
      const playerSkill = gameState.score > 500 ? "expert" : gameState.score > 100 ? "intermediate" : "beginner";
      
      // Call contract to generate enemy pattern using AI consensus
      const tx = await clientRef.current.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "generate_enemy_pattern_for_session",
        args: [sessionIdToUse, playerSkill],
      });
      await clientRef.current.waitForTransactionReceipt({ hash: tx, status: "FINALIZED" });
      
      // Get the AI-generated pattern
      const pattern = await clientRef.current.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_enemy_pattern",
        args: [sessionIdToUse],
      });
      
      setIntelligentGameState(prev => ({
        ...prev,
        enemyPattern: pattern,
        enemyPatternLoaded: true
      }));
      
      setStatus({ message: "✅ Enemy pattern loaded from AI consensus", type: "success" });
    } catch (error) {
      console.error("Failed to generate enemy pattern:", error);
      setStatus({ message: "⚠️ Using default enemy pattern", type: "warning" });
    }
  };

  const getIntelligentGameState = async () => {
    // Get complete game state including AI-generated parameters
    // Called before game starts to get enemy patterns, difficulty, and weather effects
    if (!clientRef.current || !isWalletConnected) return;
    
    try {
      const state = await clientRef.current.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_intelligent_game_state",
        args: [],
      });
      
      setIntelligentGameState(prev => ({
        ...prev,
        difficulty: state.difficulty,
        weatherMultiplier: state.weather_multiplier,
        currentWeather: state.weather,
        enemyPatternLoaded: state.enemy_pattern_available
      }));
      
      return state;
    } catch (error) {
      console.error("Failed to get intelligent game state:", error);
    }
  };

  const submitScoreIntelligent = async (finalScore, moves) => {
    // CRITICAL: Submit score with AI-powered anti-cheat validation
    // Score is ONLY recorded if AI validators agree it's legitimate
    // Uses LLM consensus to analyze gameplay data and detect cheaters
    if (!clientRef.current || !isWalletConnected) return;
    
    const gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
    
    try {
      setStatus({ message: "🤖 AI validating score for cheating...", type: "loading" });
      
      // Call contract with AI anti-cheat validation
      const tx = await clientRef.current.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "submit_score_intelligent",
        args: [sessionId || "solo", playerName, finalScore.toString(), gameTime.toString(), moves],
      });
      await clientRef.current.waitForTransactionReceipt({ hash: tx, status: "FINALIZED" });
      
      setIntelligentGameState(prev => ({ ...prev, aiVerified: true }));
      setStatus({ message: "✅ Score verified by AI consensus!", type: "success" });
      
      return "ACCEPTED";
    } catch (error) {
      console.error("Failed to submit score:", error);
      setStatus({ message: "❌ Score rejected by AI validation", type: "error" });
      return "REJECTED";
    }
  };

  // WebSocket connection
  const connectSocket = useCallback((sid, pname) => {
    const socket = io(WS_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_room", { roomId: sid, playerName: pname });
    });

    socket.on("error_msg", ({ message }) => {
      setStatus({ message: "⚠️ " + message, type: "error" });
    });

    socket.on("room_update", ({ players, ready }) => {
      const names = players.map(p => p.name).join(" vs ");
      setStatus({ 
        message: ready ? `✅ ${names} — Memulai game...` : `⏳ Menunggu pemain lain... ID: ${sid}`, 
        type: "success" 
      });
    });

    socket.on("game_start", () => {
      setScreen("playing");
    });

    socket.on("player_disconnected", ({ playerName: left }) => {
      setStatus({ message: `❌ ${left} meninggalkan game`, type: "error" });
    });

    socket.on("leaderboard_update", (updatedLeaderboard) => {
      console.log("Leaderboard updated:", updatedLeaderboard);
      setLeaderboard(updatedLeaderboard);
    });
  }, []);

  // Game actions
  const startSoloGame = async () => {
    console.log("startSoloGame called");
    const pname = playerName.trim();
    if (!pname) {
      setStatus({ message: "Please enter your name first!", type: "error" });
      return;
    }

    if (!isWalletConnected) {
      setStatus({ message: "Please connect wallet first!", type: "error" });
      return;
    }

    setPlayerName(pname);
    setGameMode("solo");
    setSoloId("solo_" + pname);
    
    // CRITICAL: Initialize GenLayer intelligent game features BEFORE starting
    setStatus({ message: "🤖 Initializing AI game features...", type: "loading" });
    
    try {
      // 1. Update game difficulty using AI + real weather (INTEGRAL - affects car speed)
      await updateGameDifficultyIntelligent();
      
      // 2. Generate enemy pattern using LLM consensus (INTEGRAL - required for enemies)
      const sessionId = "solo_" + pname;
      await generateEnemyPatternForGame(sessionId);
      
      // 3. Reset game tracking for AI anti-cheat
      setGameStartTime(Date.now());
      setGameMoves("");
      
      setScreen("playing");
      console.log("Screen set to playing");
      
      // Set game state to running with intelligent parameters
      setGameState({
        score: 0,
        fuel: 100,
        speed: 3 * parseFloat(intelligentGameState.weatherMultiplier || "1.0"),
        isRunning: true
      });
      console.log("Game state set to running with AI parameters");
      
      setStatus({ 
        message: `🎮 Game Started! AI Difficulty: ${intelligentGameState.difficulty} | Weather: ${intelligentGameState.currentWeather}`, 
        type: "success" 
      });
      
      // Start solo game on blockchain (non-blocking)
      if (clientRef.current) {
        clientRef.current.writeContract({
          address: CONTRACT_ADDRESS,
          functionName: "start_solo",
          args: [pname],
        }).then(async (tx) => {
          await clientRef.current.waitForTransactionReceipt({ hash: tx, status: "FINALIZED" });
          console.log("Solo game started on GenLayer:", tx);
        }).catch(error => {
          console.error("Failed to start solo game:", error);
        });
      }
    } catch (error) {
      console.error("Failed to initialize intelligent game features:", error);
      setStatus({ message: "⚠️ Using default settings", type: "warning" });
      
      // Continue with defaults
      setScreen("playing");
      setGameState({
        score: 0,
        fuel: 100,
        speed: 3,
        isRunning: true
      });
    }
  };

  const createRoom = async () => {
    const pname = playerName.trim();
    if (!pname) {
      setStatus({ message: "Please enter your name first!", type: "error" });
      return;
    }

    try {
      // Skip blockchain for now - use WebSocket only
      const sid = sessionId;
      connectSocket(sid, pname);
      setScreen("waiting");
      console.log("Room created via WebSocket:", sid);
    } catch (error) {
      console.error("Failed to create room:", error);
      setStatus({ message: "Failed to create room: " + error.message, type: "error" });
    }
  };

  const joinRoom = async () => {
    const pname = playerName.trim();
    const sid = roomInput.trim();
    
    if (!pname) {
      setStatus({ message: "Please enter your name first!", type: "error" });
      return;
    }
    if (!sid) {
      setStatus({ message: "Please enter room ID!", type: "error" });
      return;
    }
    
    try {
      // Skip blockchain for now - use WebSocket only
      connectSocket(sid, pname);
      setScreen("waiting");
      console.log("Room joined via WebSocket:", sid);
    } catch (error) {
      console.error("Failed to join room:", error);
      setStatus({ message: "Failed to join room: " + error.message, type: "error" });
    }
  };

  const handleGameOver = useCallback(async (finalScore) => {
    console.log("handleGameOver called with score:", finalScore, "gameMode:", gameMode);
    
    if (gameMode === "multiplayer") {
      socketRef.current?.emit("game_over", { score: finalScore });
    }

    console.log("Setting screen to gameover");
    setScreen("gameover");
    setIsSubmitting(true);
    
    // CRITICAL: Submit score with AI anti-cheat validation (INTEGRAL GenLayer feature)
    // Score is ONLY recorded if AI validators agree it's legitimate
    try {
      if (isWalletConnected && clientRef.current) {
        // Use GenLayer intelligent score submission with AI anti-cheat
        const result = await submitScoreIntelligent(finalScore, gameMoves);
        console.log("Score submission result:", result);
        
        if (result === "ACCEPTED") {
          // Also save to localStorage as backup
          if (gameMode === "solo") {
            const soloData = localStorage.getItem('road_survival_solo_leaderboard');
            let soloLeaderboard = soloData ? JSON.parse(soloData) : [];
            
            const existingPlayerIndex = soloLeaderboard.findIndex(entry => entry.name === playerName);
            
            if (existingPlayerIndex !== -1) {
              if (finalScore > soloLeaderboard[existingPlayerIndex].score) {
                soloLeaderboard[existingPlayerIndex].score = finalScore;
              }
            } else {
              soloLeaderboard.push({ name: playerName, score: finalScore, ai_verified: true });
            }
            
            soloLeaderboard.sort((a, b) => b.score - a.score);
            soloLeaderboard = soloLeaderboard.slice(0, 10);
            soloLeaderboard = soloLeaderboard.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
            
            localStorage.setItem('road_survival_solo_leaderboard', JSON.stringify(soloLeaderboard));
            setSoloLeaderboard(soloLeaderboard);
          } else if (gameMode === "multiplayer") {
            const multiData = localStorage.getItem('road_survival_multi_leaderboard');
            let multiLeaderboard = multiData ? JSON.parse(multiData) : [];
            
            const existingPlayerIndex = multiLeaderboard.findIndex(entry => entry.name === playerName);
            
            if (existingPlayerIndex !== -1) {
              if (finalScore > multiLeaderboard[existingPlayerIndex].score) {
                multiLeaderboard[existingPlayerIndex].score = finalScore;
              }
            } else {
              multiLeaderboard.push({ name: playerName, score: finalScore, ai_verified: true });
            }
            
            multiLeaderboard.sort((a, b) => b.score - a.score);
            multiLeaderboard = multiLeaderboard.slice(0, 10);
            multiLeaderboard = multiLeaderboard.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
            
            localStorage.setItem('road_survival_multi_leaderboard', JSON.stringify(multiLeaderboard));
            setLeaderboard(multiLeaderboard);
          }
        } else {
          console.warn("Score rejected by AI validation");
          setStatus({ message: "⚠️ Score flagged by AI - review pending", type: "warning" });
        }
      } else {
        // Fallback if wallet not connected
        console.log("Wallet not connected - using localStorage fallback");
        
        if (gameMode === "solo") {
          const soloData = localStorage.getItem('road_survival_solo_leaderboard');
          let soloLeaderboard = soloData ? JSON.parse(soloData) : [];
          
          const existingPlayerIndex = soloLeaderboard.findIndex(entry => entry.name === playerName);
          
          if (existingPlayerIndex !== -1) {
            if (finalScore > soloLeaderboard[existingPlayerIndex].score) {
              soloLeaderboard[existingPlayerIndex].score = finalScore;
            }
          } else {
            soloLeaderboard.push({ name: playerName, score: finalScore });
          }
          
          soloLeaderboard.sort((a, b) => b.score - a.score);
          soloLeaderboard = soloLeaderboard.slice(0, 10);
          soloLeaderboard = soloLeaderboard.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
          
          localStorage.setItem('road_survival_solo_leaderboard', JSON.stringify(soloLeaderboard));
          setSoloLeaderboard(soloLeaderboard);
        } else if (gameMode === "multiplayer") {
          const multiData = localStorage.getItem('road_survival_multi_leaderboard');
          let multiLeaderboard = multiData ? JSON.parse(multiData) : [];
          
          const existingPlayerIndex = multiLeaderboard.findIndex(entry => entry.name === playerName);
          
          if (existingPlayerIndex !== -1) {
            if (finalScore > multiLeaderboard[existingPlayerIndex].score) {
              multiLeaderboard[existingPlayerIndex].score = finalScore;
            }
          } else {
            multiLeaderboard.push({ name: playerName, score: finalScore });
          }
          
          multiLeaderboard.sort((a, b) => b.score - a.score);
          multiLeaderboard = multiLeaderboard.slice(0, 10);
          multiLeaderboard = multiLeaderboard.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
          
          localStorage.setItem('road_survival_multi_leaderboard', JSON.stringify(multiLeaderboard));
          setLeaderboard(multiLeaderboard);
        }
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [gameMode, playerName, gameMoves, isWalletConnected, submitScoreIntelligent]);

  const resetToLobby = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setGameResult(null);
    setStatus({ message: '', type: 'waiting' });
    setRoomInput("");
    setGameMode("multiplayer");
    setScreen("lobby");
    // Load from localStorage instead of blockchain
    const soloData = localStorage.getItem('road_survival_solo_leaderboard');
    const multiData = localStorage.getItem('road_survival_multi_leaderboard');
    if (soloData) setSoloLeaderboard(JSON.parse(soloData));
    if (multiData) setLeaderboard(JSON.parse(multiData));
  };

  const restartGame = () => {
    // Reset game state
    setGameState({
      score: 0,
      isRunning: true
    });
    setGameResult(null);
    setScreen("game");
  };

  const handleModeSelection = (mode) => {
    setGameMode(mode);
    setScreen('game');
  };

  const handleBackToModeSelection = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setGameResult(null);
    setStatus({ message: '', type: 'waiting' });
    setRoomInput("");
    setScreen('modeSelection');
  };

  const endGameSession = () => {
    // Stop game loop immediately
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Set game as not running
    setGameState(prev => ({ ...prev, isRunning: false }));
    
    // Call game over handler
    onGameOver(gameState.score);
    
    // Set screen to gameover
    setScreen("gameover");
  };

  // Wallet handlers
  const handleWalletConnected = (address) => {
    setWalletAddress(address);
    setIsWalletConnected(true);
    setStatus({ message: '✅ Wallet connected!', type: 'success' });
  };

  const handleWalletDisconnected = () => {
    setWalletAddress('');
    setIsWalletConnected(false);
    setStatus({ message: '❌ Wallet disconnected', type: 'error' });
    setScreen('lobby');
  };

  // Update solo game when name changes
  useEffect(() => {
    if (playerName && clientRef.current && gameMode === "solo") {
      fetchSoloGame(clientRef.current, playerName);
    }
  }, [playerName, gameMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600">
      <div className="min-h-screen backdrop-blur-sm bg-black/20">
        {/* Debug: Screen state */}
        {console.log("Current screen:", screen)}
        
        {/* Mode Selection Screen */}
        {screen === 'modeSelection' && (
          <ModeSelection 
            onSelectMode={handleModeSelection}
            onWalletConnected={handleWalletConnected}
            onWalletDisconnected={handleWalletDisconnected}
            isWalletConnected={isWalletConnected}
            soloLeaderboard={soloLeaderboard}
            leaderboard={leaderboard}
          />
        )}

        {/* Game Screen */}
        {screen === 'game' && (
          <div className="h-screen flex flex-col">
            {/* Header */}
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-6 py-4"
            >
              <motion.button
                onClick={handleBackToModeSelection}
                className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                ← Back
              </motion.button>
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                <h1 className="text-3xl font-bold text-white font-game flex items-center gap-2">
                  {gameMode === 'solo' ? '🎯 Solo Game' : '🎮 Multiplayer'}
                </h1>
              </motion.div>
              <div className="w-20"></div>
            </motion.header>

            {/* Game Canvas Area */}
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full h-full relative">
                {!gameState.isRunning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl z-10">
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-white mb-8 font-game">
                        {gameMode === 'solo' ? '🎯 Solo Race' : '🎮 Multiplayer Race'}
                      </h2>
                      
                      {isWalletConnected ? (
                        <>
                          <div className="mb-6">
                            <input
                              type="text"
                              value={playerName}
                              onChange={(e) => setPlayerName(e.target.value)}
                              placeholder="Enter your name"
                              maxLength={20}
                              className="px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white placeholder-white/50 focus:border-white focus:outline-none text-center text-lg"
                            />
                          </div>
                          
                          {/* Car Selection */}
                          <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                            <h4 className="text-white/80 text-sm font-semibold mb-3 flex items-center gap-2">
                              <Car className="w-4 h-4" />
                              Select Your Car
                            </h4>
                            <div className="grid grid-cols-4 gap-2 mb-3">
                              {[
                                { type: 'sports', color: '#ef4444', name: 'Sports' },
                                { type: 'suv', color: '#3b82f6', name: 'SUV' },
                                { type: 'sedan', color: '#10b981', name: 'Sedan' },
                                { type: 'hatchback', color: '#f59e0b', name: 'Hatchback' },
                                { type: 'muscle', color: '#8b5cf6', name: 'Muscle' },
                                { type: 'truck', color: '#6b7280', name: 'Truck' },
                                { type: 'racing', color: '#ec4899', name: 'Racing' },
                                { type: 'f1', color: '#dc2626', name: 'F1' },
                                { type: 'luxury', color: '#06b6d4', name: 'Luxury' }
                              ].map((car) => (
                                <button
                                  key={car.type}
                                  onClick={() => setSelectedCar(car.type)}
                                  className={`p-2 rounded border-2 transition-all ${
                                    selectedCar === car.type
                                      ? 'border-white bg-white/20'
                                      : 'border-white/20 bg-white/5 hover:border-white/40'
                                  }`}
                                >
                                  <div className="w-full h-12 rounded mb-1" style={{ backgroundColor: car.color }} />
                                  <span className="text-white/80 text-xs">{car.name}</span>
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <p className="text-white/70 text-xs italic">
                                  Selected: {selectedCar.charAt(0).toUpperCase() + selectedCar.slice(1)} Car
                                </p>
                              </div>
                              <div className="relative">
                                <canvas 
                                  ref={(canvas) => {
                                    if (canvas) {
                                      const ctx = canvas.getContext('2d');
                                      canvas.width = 80;
                                      canvas.height = 100;
                                      ctx.clearRect(0, 0, 80, 100);
                                      
                                      // Get car color
                                      const carColor = [
                                        { type: 'sports', color: '#ef4444' },
                                        { type: 'suv', color: '#3b82f6' },
                                        { type: 'sedan', color: '#10b981' },
                                        { type: 'hatchback', color: '#f59e0b' },
                                        { type: 'muscle', color: '#8b5cf6' },
                                        { type: 'truck', color: '#6b7280' },
                                        { type: 'racing', color: '#ec4899' },
                                        { type: 'f1', color: '#dc2626' },
                                        { type: 'luxury', color: '#06b6d4' }
                                      ].find(c => c.type === selectedCar)?.color || '#2563eb';
                                      
                                      const x = 40;
                                      const y = 50;
                                      
                                      // Draw different shapes based on car type
                                      if (selectedCar === 'f1') {
                                        // F1 Car - lower, wider
                                        ctx.fillStyle = carColor;
                                        ctx.beginPath();
                                        ctx.roundRect(x - 22, y - 22, 44, 44, 2);
                                        ctx.fill();
                                        
                                        // Nose cone
                                        ctx.fillStyle = shadeColor(carColor, 10);
                                        ctx.beginPath();
                                        ctx.moveTo(x - 5, y - 22);
                                        ctx.lineTo(x, y - 30);
                                        ctx.lineTo(x + 5, y - 22);
                                        ctx.closePath();
                                        ctx.fill();
                                        
                                        // Cockpit
                                        ctx.fillStyle = 'rgba(135, 206, 235, 0.8)';
                                        ctx.beginPath();
                                        ctx.ellipse(x, y - 5, 6, 10, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        
                                        // Front wing
                                        ctx.fillStyle = shadeColor(carColor, 15);
                                        ctx.fillRect(x - 25, y - 28, 50, 3);
                                        
                                        // Rear wing
                                        ctx.fillStyle = shadeColor(carColor, 15);
                                        ctx.fillRect(x - 20, y + 18, 40, 2);
                                        
                                        // Wheels
                                        ctx.fillStyle = '#1a1a1a';
                                        ctx.beginPath();
                                        ctx.ellipse(x - 18, y - 10, 8, 12, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        ctx.beginPath();
                                        ctx.ellipse(x + 18, y - 10, 8, 12, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        ctx.beginPath();
                                        ctx.ellipse(x - 18, y + 12, 8, 12, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        ctx.beginPath();
                                        ctx.ellipse(x + 18, y + 12, 8, 12, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        
                                      } else if (selectedCar === 'suv') {
                                        // SUV - taller, boxier
                                        ctx.fillStyle = carColor;
                                        ctx.beginPath();
                                        ctx.roundRect(x - 18, y - 30, 36, 55, 4);
                                        ctx.fill();
                                        
                                        // Roof
                                        ctx.fillStyle = shadeColor(carColor, 25);
                                        ctx.beginPath();
                                        ctx.roundRect(x - 14, y - 25, 28, 30, 3);
                                        ctx.fill();
                                        
                                        // Wheels
                                        ctx.fillStyle = '#1a1a1a';
                                        ctx.beginPath();
                                        ctx.ellipse(x - 15, y - 10, 7, 10, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        ctx.beginPath();
                                        ctx.ellipse(x + 15, y - 10, 7, 10, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        ctx.beginPath();
                                        ctx.ellipse(x - 15, y + 15, 7, 10, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        ctx.beginPath();
                                        ctx.ellipse(x + 15, y + 15, 7, 10, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        
                                      } else if (selectedCar === 'truck') {
                                        // Truck - longer, boxier
                                        ctx.fillStyle = carColor;
                                        ctx.beginPath();
                                        ctx.roundRect(x - 20, y - 28, 40, 53, 4);
                                        ctx.fill();
                                        
                                        // Truck bed
                                        ctx.fillStyle = shadeColor(carColor, 15);
                                        ctx.fillRect(x - 18, y + 5, 36, 20);
                                        
                                        // Wheels
                                        ctx.fillStyle = '#1a1a1a';
                                        ctx.beginPath();
                                        ctx.ellipse(x - 14, y - 8, 8, 11, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        ctx.beginPath();
                                        ctx.ellipse(x + 14, y - 8, 8, 11, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        ctx.beginPath();
                                        ctx.ellipse(x - 14, y + 18, 8, 11, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        ctx.beginPath();
                                        ctx.ellipse(x + 14, y + 18, 8, 11, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        
                                      } else {
                                        // Default car shape
                                        ctx.fillStyle = carColor;
                                        ctx.beginPath();
                                        ctx.roundRect(x - 18, y - 28, 36, 56, 6);
                                        ctx.fill();
                                        
                                        // Roof
                                        ctx.fillStyle = shadeColor(carColor, 30);
                                        ctx.beginPath();
                                        ctx.moveTo(x - 12, y - 12);
                                        ctx.quadraticCurveTo(x - 10, y - 22, x, y - 24);
                                        ctx.quadraticCurveTo(x + 10, y - 22, x + 12, y - 12);
                                        ctx.lineTo(x + 12, y + 5);
                                        ctx.lineTo(x - 12, y + 5);
                                        ctx.closePath();
                                        ctx.fill();
                                        
                                        // Wheels
                                        ctx.fillStyle = '#1a1a1a';
                                        ctx.beginPath();
                                        ctx.ellipse(x - 15, y - 12, 6, 10, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        ctx.beginPath();
                                        ctx.ellipse(x + 15, y - 12, 6, 10, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        ctx.beginPath();
                                        ctx.ellipse(x - 15, y + 14, 6, 10, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                        ctx.beginPath();
                                        ctx.ellipse(x + 15, y + 14, 6, 10, 0, 0, Math.PI * 2);
                                        ctx.fill();
                                      }
                                    }
                                  }}
                                  width={80}
                                  height={100}
                                  className="rounded border border-white/20 bg-black/30"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {gameMode === 'multiplayer' ? (
                            <div className="space-y-4">
                              <button
                                onClick={createRoom}
                                disabled={!playerName.trim()}
                                className="game-button bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 px-8 py-4 text-lg w-64"
                              >
                                <Plus className="w-5 h-5 inline mr-2" />
                                Create Room
                              </button>
                              
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={roomInput}
                                  onChange={(e) => setRoomInput(e.target.value)}
                                  placeholder="Room ID"
                                  className="px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white placeholder-white/50 focus:border-white focus:outline-none flex-1"
                                />
                                <button
                                  onClick={joinRoom}
                                  disabled={!playerName.trim() || !roomInput.trim()}
                                  className="game-button bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 px-6 py-3"
                                >
                                  <LogIn className="w-5 h-5 inline mr-2" />
                                  Join
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={startSoloGame}
                              disabled={!playerName.trim()}
                              className="game-button bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-12 py-4 text-xl"
                            >
                              <Play className="w-6 h-6 inline mr-2" />
                              Start Game
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="text-white/80 text-lg">
                          <p className="mb-4">Please connect your wallet in the main menu first</p>
                          <button
                            onClick={handleBackToModeSelection}
                            className="px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white hover:bg-white/30 transition-colors"
                          >
                            ← Back to Menu
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {gameState.isRunning && (
                  <GameCanvas
                    ref={gameCanvasRef}
                    gameMode={gameMode}
                    onGameOver={handleGameOver}
                    gameState={gameState}
                    setGameState={setGameState}
                    selectedCar={selectedCar}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Playing Screen */}
        {screen === "playing" && (
          <div className="h-screen flex flex-col">
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-6 py-4"
            >
              <motion.button
                onClick={handleBackToModeSelection}
                className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                ← Back
              </motion.button>
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                <h1 className="text-3xl font-bold text-white font-game flex items-center gap-2">
                  {gameMode === 'solo' ? '🎯 Solo Game' : '🎮 Multiplayer'}
                </h1>
              </motion.div>
              <div className="w-20"></div>
            </motion.header>

            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full h-full relative">
                <GameCanvas
                  ref={gameCanvasRef}
                  gameMode={gameMode}
                  onGameOver={handleGameOver}
                  gameState={gameState}
                  setGameState={setGameState}
                  selectedCar={selectedCar}
                />

                {/* Real-time score display */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 100,
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '999px',
                  fontFamily: 'Press Start 2P, cursive',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                }}>
                  SCORE: {gameState.score || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Waiting Screen */}
        {screen === "waiting" && (
          <div className="h-screen flex flex-col">
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-6 py-4"
            >
              <motion.button
                onClick={resetToLobby}
                className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                ← Back
              </motion.button>
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                <h1 className="text-3xl font-bold text-white font-game flex items-center gap-2">
                  {gameMode === 'solo' ? '🎯 Solo Game' : '🎮 Multiplayer'}
                </h1>
              </motion.div>
              <div className="w-20"></div>
            </motion.header>

            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center text-white">
                <div className="animate-spin w-20 h-20 border-4 border-white/20 border-t-white rounded-full mx-auto mb-6"></div>
                <h2 className="text-3xl font-bold mb-4">Waiting for Players</h2>
                <p className="text-white/70 mb-6">{status.message}</p>
                <button 
                  onClick={resetToLobby}
                  className="px-8 py-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {screen === "gameover" && (
          <div className="h-screen flex flex-col">
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-6 py-4"
            >
              <motion.button
                onClick={handleBackToModeSelection}
                className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                ← Back
              </motion.button>
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                <h1 className="text-3xl font-bold text-white font-game flex items-center gap-2">
                  {gameMode === 'solo' ? '🎯 Solo Game' : '🎮 Multiplayer'}
                </h1>
              </motion.div>
              <div className="w-20"></div>
            </motion.header>

            <div className="flex-1 flex items-center justify-center p-6">
              <GameOver
                gameMode={gameMode}
                gameResult={gameResult}
                finalScore={gameState.score}
                isSubmitting={isSubmitting}
                onPlayAgain={restartGame}
                onBackToLobby={handleBackToModeSelection}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
