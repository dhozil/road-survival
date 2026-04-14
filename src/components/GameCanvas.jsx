import React, { useEffect, useRef, useCallback } from 'react';

const CW = 400;
const CH = 600;
const ROAD_L = 55;
const ROAD_R = 345;
const LANES = [100, 200, 300];

const GameCanvas = React.forwardRef(({ gameState, setGameState, onGameOver, gameMode, selectedCar }, ref) => {
  console.log("GameCanvas component rendering", { gameState, gameMode });
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const keysRef = useRef({});
  const containerRef = useRef(null);

  const gameDataRef = useRef({
    player: { x: 200, y: 500, lane: 1 },
    enemies: [],
    roadOffset: 0,
    spawnTimer: 0,
    score: 0
  });

  // Audio context for sound effects
  const audioContextRef = useRef(null);
  const engineOscillatorRef = useRef(null);
  const engineGainRef = useRef(null);

  // Expose gameDataRef to parent component
  if (ref) {
    ref.current = gameDataRef;
  }

  // Reset score when game starts
  useEffect(() => {
    gameDataRef.current.score = 0;
    setGameState(prev => ({ ...prev, score: 0 }));
  }, []);

  // Initialize audio context
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  // Start engine sound
  const startEngineSound = () => {
    initAudio();
    if (engineOscillatorRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(80, audioContextRef.current.currentTime);
    
    gainNode.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start();
    engineOscillatorRef.current = oscillator;
    engineGainRef.current = gainNode;
  };

  // Stop engine sound
  const stopEngineSound = () => {
    if (engineOscillatorRef.current) {
      engineOscillatorRef.current.stop();
      engineOscillatorRef.current = null;
      engineGainRef.current = null;
    }
  };

  // Play collision sound
  const playCollisionSound = () => {
    initAudio();
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, audioContextRef.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContextRef.current.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.3);
  };

  // Update engine sound based on speed
  const updateEngineSound = (speed) => {
    if (engineOscillatorRef.current && engineGainRef.current) {
      const baseFreq = 80 + speed * 10;
      engineOscillatorRef.current.frequency.setValueAtTime(baseFreq, audioContextRef.current.currentTime);
    }
  };

  // 🎮 INPUT
  useEffect(() => {
    const down = (e) => (keysRef.current[e.key] = true);
    const up = (e) => (keysRef.current[e.key] = false);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Start/stop engine sound based on game state
  useEffect(() => {
    if (gameState.isRunning) {
      startEngineSound();
    } else {
      stopEngineSound();
    }

    return () => {
      stopEngineSound();
    };
  }, [gameState.isRunning]);

  // 🚗 DRAW CAR
  // ✅ Different car shapes based on type
  const drawCar = (ctx, x, y, isPlayer = false, enemyCarType = null) => {
    // Car colors based on type
    const carColors = {
      sports: '#ef4444',
      suv: '#3b82f6',
      sedan: '#10b981',
      hatchback: '#f59e0b',
      muscle: '#8b5cf6',
      truck: '#6b7280',
      racing: '#ec4899',
      f1: '#dc2626',
      luxury: '#06b6d4'
    };
    
    // Different colors for player vs enemy
    const carType = isPlayer ? selectedCar : (enemyCarType || 'sports');
    const playerColor = carColors[selectedCar] || '#2563eb';
    const enemyColor = carColors[carType] || '#dc2626';
    const color = isPlayer ? playerColor : enemyColor;
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + 28, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Different shapes for different car types
    if (carType === 'f1') {
      // F1 Car shape - lower, wider, more aerodynamic
      const f1Gradient = ctx.createLinearGradient(x - 20, y - 20, x + 20, y + 20);
      f1Gradient.addColorStop(0, color);
      f1Gradient.addColorStop(0.5, shadeColor(color, 20));
      f1Gradient.addColorStop(1, shadeColor(color, -20));
      
      ctx.fillStyle = f1Gradient;
      ctx.beginPath();
      ctx.roundRect(x - 22, y - 22, 44, 44, 3);
      ctx.fill();
      
      // F1 nose cone
      ctx.fillStyle = shadeColor(color, 10);
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 22);
      ctx.lineTo(x, y - 30);
      ctx.lineTo(x + 5, y - 22);
      ctx.closePath();
      ctx.fill();
      
      // F1 cockpit
      ctx.fillStyle = 'rgba(135, 206, 235, 0.8)';
      ctx.beginPath();
      ctx.ellipse(x, y - 5, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // F1 front wing
      ctx.fillStyle = shadeColor(color, 15);
      ctx.fillRect(x - 25, y - 28, 50, 4);
      
      // F1 rear wing
      ctx.fillStyle = shadeColor(color, 15);
      ctx.fillRect(x - 20, y + 18, 40, 3);
      
      // F1 wheels (exposed)
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(x - 18, y - 10, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 18, y - 10, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x - 18, y + 12, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 18, y + 12, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      
    } else if (carType === 'suv') {
      // SUV shape - taller, boxier
      const suvGradient = ctx.createLinearGradient(x - 18, y - 30, x + 18, y + 25);
      suvGradient.addColorStop(0, color);
      suvGradient.addColorStop(0.5, shadeColor(color, 20));
      suvGradient.addColorStop(1, shadeColor(color, -20));
      
      ctx.fillStyle = suvGradient;
      ctx.beginPath();
      ctx.roundRect(x - 18, y - 30, 36, 55, 6);
      ctx.fill();
      
      // SUV roof (boxier)
      ctx.fillStyle = shadeColor(color, 25);
      ctx.beginPath();
      ctx.roundRect(x - 14, y - 25, 28, 30, 4);
      ctx.fill();
      
      // SUV wheels (larger)
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(x - 15, y - 10, 9, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 15, y - 10, 9, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x - 15, y + 15, 9, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 15, y + 15, 9, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      
    } else if (carType === 'truck') {
      // Truck shape - longer, boxier
      const truckGradient = ctx.createLinearGradient(x - 20, y - 28, x + 20, y + 25);
      truckGradient.addColorStop(0, color);
      truckGradient.addColorStop(0.5, shadeColor(color, 20));
      truckGradient.addColorStop(1, shadeColor(color, -20));
      
      ctx.fillStyle = truckGradient;
      ctx.beginPath();
      ctx.roundRect(x - 20, y - 28, 40, 53, 5);
      ctx.fill();
      
      // Truck bed
      ctx.fillStyle = shadeColor(color, 15);
      ctx.fillRect(x - 18, y + 5, 36, 20);
      
      // Truck wheels (larger)
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(x - 14, y - 8, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 14, y - 8, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x - 14, y + 18, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 14, y + 18, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      
    } else {
      // Default car shape for sports, sedan, hatchback, muscle, racing, luxury
      const carGradient = ctx.createLinearGradient(x - 15, y - 25, x + 15, y + 25);
      carGradient.addColorStop(0, color);
      carGradient.addColorStop(0.5, shadeColor(color, 20));
      carGradient.addColorStop(1, shadeColor(color, -20));

      // Body utama dengan rounded corners
      ctx.fillStyle = carGradient;
      ctx.beginPath();
      ctx.roundRect(x - 18, y - 28, 36, 56, 8);
      ctx.fill();

      // Hood (kap mesin)
      ctx.fillStyle = shadeColor(color, 10);
      ctx.beginPath();
      ctx.roundRect(x - 16, y - 26, 32, 15, 4);
      ctx.fill();

      // Atap mobil (kurva aerodinamis)
      ctx.fillStyle = shadeColor(color, 30);
      ctx.beginPath();
      ctx.moveTo(x - 12, y - 12);
      ctx.quadraticCurveTo(x - 10, y - 22, x, y - 24);
      ctx.quadraticCurveTo(x + 10, y - 22, x + 12, y - 12);
      ctx.lineTo(x + 12, y + 5);
      ctx.lineTo(x - 12, y + 5);
      ctx.closePath();
      ctx.fill();

      // Windshield (kaca depan)
      ctx.fillStyle = 'rgba(135, 206, 235, 0.7)';
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 10);
      ctx.quadraticCurveTo(x - 8, y - 18, x, y - 20);
      ctx.quadraticCurveTo(x + 8, y - 18, x + 10, y - 10);
      ctx.lineTo(x + 10, y - 2);
      ctx.lineTo(x - 10, y - 2);
      ctx.closePath();
      ctx.fill();

      // Rear window (kaca belakang)
      ctx.fillStyle = 'rgba(135, 206, 235, 0.6)';
      ctx.beginPath();
      ctx.moveTo(x - 10, y + 2);
      ctx.lineTo(x + 10, y + 2);
      ctx.lineTo(x + 10, y + 8);
      ctx.lineTo(x - 10, y + 8);
      ctx.closePath();
      ctx.fill();

      // Headlights (lampu depan) dengan glow
      ctx.shadowColor = '#ffff99';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffff99';
      ctx.beginPath();
      ctx.roundRect(x - 15, y - 27, 10, 6, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + 5, y - 27, 10, 6, 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Taillights (lampu belakang) dengan glow
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.roundRect(x - 15, y + 21, 10, 6, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + 5, y + 21, 10, 6, 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Grille (gril depan)
      ctx.fillStyle = '#333';
      ctx.fillRect(x - 8, y - 24, 16, 4);
      ctx.fillStyle = '#444';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(x - 6 + i * 3, y - 23, 2, 2);
      }

      // Side mirrors (spion)
      ctx.fillStyle = shadeColor(color, 15);
      ctx.beginPath();
      ctx.roundRect(x - 19, y - 15, 4, 6, 1);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + 15, y - 15, 4, 6, 1);
      ctx.fill();

      // Wheels (roda) dengan detail
      const drawWheel = (wx, wy) => {
        // Tire
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(wx, wy, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Rim
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.ellipse(wx, wy, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Hub
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(wx, wy, 3, 0, Math.PI * 2);
        ctx.fill();
      };

      drawWheel(x - 15, y - 12);
      drawWheel(x + 15, y - 12);
      drawWheel(x - 15, y + 14);
      drawWheel(x + 15, y + 14);

      // Side stripe (garis samping)
      ctx.fillStyle = shadeColor(color, 40);
      ctx.fillRect(x - 16, y, 32, 2);
    }
    
    // Player car gets special indicator (star or arrow)
    if (isPlayer) {
      ctx.fillStyle = '#ffd700';
      ctx.font = '12px Arial';
      ctx.fillText('★', x - 6, y - 35);
    }
  };

  // Helper function to shade colors
  function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  // 🛣️ DRAW ROAD
  const drawRoad = (ctx, offset) => {
    // Background (grass/terrain)
    ctx.fillStyle = "#2d5016";
    ctx.fillRect(0, 0, CW, CH);

    // Draw scenery on left side (grass area)
    drawScenery(ctx, offset, 0, ROAD_L, true);

    // Draw scenery on right side (grass area)
    drawScenery(ctx, offset, ROAD_R, CW, false);

    // Road texture (asphalt)
    const roadGradient = ctx.createLinearGradient(ROAD_L, 0, ROAD_R, 0);
    roadGradient.addColorStop(0, "#3a3a3a");
    roadGradient.addColorStop(0.5, "#4a4a4a");
    roadGradient.addColorStop(1, "#3a3a3a");
    ctx.fillStyle = roadGradient;
    ctx.fillRect(ROAD_L, 0, ROAD_R - ROAD_L, CH);

    // Road edges (solid white lines)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ROAD_L, 0);
    ctx.lineTo(ROAD_L, CH);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(ROAD_R, 0);
    ctx.lineTo(ROAD_R, CH);
    ctx.stroke();

    // Center dashed line
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.setLineDash([30, 30]);
    ctx.lineDashOffset = -offset;

    ctx.beginPath();
    ctx.moveTo(200, 0);
    ctx.lineTo(200, CH);
    ctx.stroke();

    ctx.setLineDash([]);

    // Lane dividers (subtle)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.setLineDash([15, 15]);
    ctx.lineDashOffset = -offset;
    
    ctx.beginPath();
    ctx.moveTo(150, 0);
    ctx.lineTo(150, CH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(250, 0);
    ctx.lineTo(250, CH);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;
  };

  // 🌳 DRAW SCENERY
  const drawScenery = (ctx, offset, startX, endX, isLeft) => {
    const width = endX - startX;
    
    // Generate random scenery positions based on offset
    const seed = Math.floor(offset / 100);
    const random = (n) => {
      const x = Math.sin(seed + n) * 10000;
      return x - Math.floor(x);
    };

    // Draw trees
    for (let i = 0; i < 8; i++) {
      const baseY = ((seed + i * 47) % 20) * 50 - offset % 50;
      const x = startX + random(i) * width * 0.8 + width * 0.1;
      
      if (baseY > -50 && baseY < CH + 50) {
        // Tree trunk
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(x - 3, baseY, 6, 20);
        
        // Tree foliage (triangle)
        ctx.fillStyle = "#228B22";
        ctx.beginPath();
        ctx.moveTo(x, baseY - 30);
        ctx.lineTo(x - 15, baseY);
        ctx.lineTo(x + 15, baseY);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Draw buildings
    for (let i = 0; i < 4; i++) {
      const baseY = ((seed + i * 73) % 15) * 70 - offset % 70;
      const x = startX + random(i + 20) * width * 0.6 + width * 0.2;
      const buildingWidth = 15 + random(i + 30) * 10;
      const buildingHeight = 30 + random(i + 40) * 20;
      
      if (baseY > -50 && baseY < CH + 50) {
        // Building body
        ctx.fillStyle = "#808080";
        ctx.fillRect(x - buildingWidth / 2, baseY - buildingHeight, buildingWidth, buildingHeight);
        
        // Windows
        ctx.fillStyle = "#ADD8E6";
        for (let w = 0; w < 3; w++) {
          for (let h = 0; h < Math.floor(buildingHeight / 15); h++) {
            ctx.fillRect(
              x - buildingWidth / 2 + 3 + w * 5,
              baseY - buildingHeight + 5 + h * 12,
              3,
              5
            );
          }
        }
      }
    }

    // Draw mountains in background
    ctx.fillStyle = "#6B8E23";
    ctx.beginPath();
    ctx.moveTo(startX, CH);
    ctx.lineTo(startX + width * 0.3, CH - 100);
    ctx.lineTo(startX + width * 0.6, CH);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = "#556B2F";
    ctx.beginPath();
    ctx.moveTo(startX + width * 0.4, CH);
    ctx.lineTo(startX + width * 0.7, CH - 80);
    ctx.lineTo(startX + width * 0.9, CH);
    ctx.closePath();
    ctx.fill();
  };

  // 🎮 GAME LOOP
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const game = gameDataRef.current;

    // 🎯 LANE CONTROL (lebih smooth & tidak spam)
    if (keysRef.current["ArrowLeft"]) {
      game.player.lane = Math.max(0, game.player.lane - 1);
      keysRef.current["ArrowLeft"] = false;
    }

    if (keysRef.current["ArrowRight"]) {
      game.player.lane = Math.min(2, game.player.lane + 1);
      keysRef.current["ArrowRight"] = false;
    }

    // Smooth movement ke lane
    const targetX = LANES[game.player.lane];
    game.player.x += (targetX - game.player.x) * 0.15;

    // 🚗 SPEED (BALANCED)
    const baseSpeed = 1.5;
    const speed = baseSpeed + game.score * 0.0015;

    game.roadOffset += speed;
    
    // Update engine sound based on speed
    updateEngineSound(speed);

    // 🧠 SPAWN MUSUH (lebih santai)
    game.spawnTimer++;
    if (game.spawnTimer > 90) {
      game.spawnTimer = 0;
      const lane = Math.floor(Math.random() * 3);
      const enemyCarTypes = ['sports', 'suv', 'sedan', 'hatchback', 'muscle', 'truck', 'racing', 'luxury'];

      game.enemies.push({
        x: LANES[lane],
        y: -50,
        carType: enemyCarTypes[Math.floor(Math.random() * enemyCarTypes.length)]
      });
    }

    // 🚙 MOVE ENEMY
    game.enemies.forEach(e => e.y += speed);

    // 🧹 CLEANUP
    game.enemies = game.enemies.filter(e => e.y < CH + 50);

    // 💥 COLLISION
    for (let e of game.enemies) {
      if (
        Math.abs(e.x - game.player.x) < 25 &&
        Math.abs(e.y - game.player.y) < 40
      ) {
        console.log("Collision detected! Score:", game.score);
        playCollisionSound();
        onGameOver(game.score);
        return;
      }
    }

    // 📈 SCORE
    game.score++;
    // Update score every frame for real-time display
    setGameState(prev => ({ ...prev, score: game.score }));

    // 🎨 DRAW
    ctx.clearRect(0, 0, CW, CH);
    drawRoad(ctx, game.roadOffset);

    drawCar(ctx, game.player.x, game.player.y, true); // Player car

    game.enemies.forEach(e => {
      drawCar(ctx, e.x, e.y, false, e.carType); // Enemy cars with their type
    });

    animationRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    console.log("GameCanvas useEffect called, canvasRef:", canvasRef.current);
    const startLoop = () => {
      console.log("startLoop called, canvasRef:", canvasRef.current, "animationRef:", animationRef.current);
      if (canvasRef.current && !animationRef.current) {
        console.log("Starting game loop");
        animationRef.current = requestAnimationFrame(loop);
      }
    };
    
    // Small delay to ensure canvas is ready
    const timeoutId = setTimeout(startLoop, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        style={{ borderRadius: "12px", background: "#111", maxWidth: "100%", maxHeight: "100%" }}
      />
    </div>
  );
});

export default GameCanvas;
export { GameCanvas };
