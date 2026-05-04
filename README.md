# 🚗 Road Survival - Multiplayer Racing Game

**Advanced Web Application with React + GenLayer Blockchain**

## 🌟 Features

### 🎮 Game Modes
- **Multiplayer** - Real-time racing with other players
- **Solo Practice** - Training mode to improve skills
- **Room System** - Create/join custom game rooms

### 🚗 Car Selection System
- **9 Unique Car Types**: Sports, SUV, Sedan, Hatchback, Muscle, Truck, Racing, F1, Luxury
- **Different Car Shapes**: Each car type has unique visual design (F1 with nose cone & wings, SUV taller & boxier, Truck longer with bed, etc.)
- **Color Variations**: Each car type has distinct color scheme
- **Live Preview**: See car preview before selecting

### 🔊 Sound Effects
- **Engine Sound**: Dynamic engine sound that changes based on speed
- **Collision Sound**: Impact sound when crashing into enemy cars
- **Web Audio API**: High-quality synthesized sounds without external files

### 🌲 Realistic Environment
- **Dynamic Scenery**: Trees, buildings, and mountains on both sides of the road
- **Moving Background**: Scenery moves with road for realistic speed sensation
- **Depth Effect**: Mountains in background, buildings mid-ground, trees foreground
- **Variety**: Random placement for natural look

### 🎨 Modern UI/UX
- **React 18** - Modern component architecture
- **Tailwind CSS** - Responsive, utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Lucide Icons** - Beautiful, consistent iconography
- **Mobile Responsive** - Works on all devices

### ⚡ Technology Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Blockchain**: GenLayer Studionet
- **Real-time**: Socket.IO WebSocket
- **Game Engine**: HTML5 Canvas + JavaScript
- **Build Tool**: Vite (fast HMR)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- GenLayer account (for contract deployment)

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm run dev
```
Open http://localhost:5173

3. **Deploy Contract**
```bash
# Deploy contracts/road_survival.py to GenLayer Studio
# Get contract address and update in src/App.jsx
```

**Current Contract Address:** `0xe57698b060FDB0B69554a3864558D11a4c03F071`

## 📁 Project Structure

```
RoadSurvivalGame/
├── src/
│   ├── components/
│   │   ├── GameCanvas.jsx      # Game rendering engine with car shapes & scenery
│   │   ├── GameControls.jsx    # Player controls panel
│   │   ├── Leaderboard.jsx     # Score leaderboard
│   │   ├── RoomList.jsx        # Multiplayer rooms
│   │   ├── GameStats.jsx       # Game statistics
│   │   ├── GameOver.jsx        # Game over screen with restart
│   │   ├── WalletConnect.jsx  # Wallet connection component
│   │   ├── GenLayerFeatures.jsx # GenLayer AI features (weather, car descriptions)
│   │   └── ModeSelection.jsx   # Game mode selection screen
│   ├── App.jsx                 # Main application with car selection
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── contracts/
│   └── road_survival.py        # GenLayer smart contract
├── package.json               # Dependencies
├── vite.config.js             # Build config
├── tailwind.config.js         # Tailwind configuration
└── index.html                # HTML template
```

## 🎯 Game Controls

### Keyboard Controls
- **← → Arrow Keys** - Move left/right between lanes
- **A/D Keys** - Alternative movement
- **Space** - Start game (when ready)

### Game Mechanics
- **Avoid enemy cars** - Collision = game over
- **Enemy variety** - Enemy cars have random types and colors, different from player car
- **Speed increase** - Gets faster as score increases
- **Engine sound** - Dynamic engine sound changes with speed
- **Collision sound** - Impact sound when crashing
- **Restart** - Click "Main Lagi" to instantly restart after game over

## ⛓️ Blockchain Integration

### Smart Contract
- **Contract Name**: `RoadSurvivalGame`
- **Network**: GenLayer Studionet
- **Storage**: String-based key-value pairs

### Key Functions

#### Basic Game Functions
```python
# Solo Mode
@gl.public.write
def start_solo(self, player_name: str)

@gl.public.write
def submit_solo_score(self, player_name: str, score: str)

# Multiplayer Mode  
@gl.public.write
def create_session(self, session_id: str, player_name: str)

@gl.public.write
def join_session(self, session_id: str, player_name: str)

@gl.public.write
def submit_score(self, session_id: str, player_name: str, score: str)

# Real-time Stats
@gl.public.view
def get_stats(self)  # Returns "totalGames:activePlayers"

@gl.public.view
def get_leaderboard(self)

@gl.public.view
def get_solo_leaderboard(self)
```

#### INTEGRAL GenLayer Functions (Required for Gameplay)
```python
# AI Anti-Cheat Score Submission (CRITICAL)
@gl.public.write
def submit_score_intelligent(self, session_id, player_name, score, game_time, moves)
# Uses LLM consensus to validate score legitimacy - detects cheaters

# Dynamic Difficulty from Real Weather (CRITICAL)  
@gl.public.write
def update_game_difficulty(self, city: str)
# Fetches real weather + AI calculates difficulty - affects car speed

# AI-Generated Enemy Patterns (CRITICAL)
@gl.public.write
def generate_enemy_pattern_for_session(self, session_id: str, player_skill: str)
# LLM generates enemy spawn intervals based on skill + weather

# Get Complete Game State
@gl.public.view
def get_intelligent_game_state(self)
# Returns: weather, difficulty, speed multiplier, enemy pattern availability
```

### Data Format
- **Sessions**: `"session_id:player_name:status"`
- **Scores**: `"player_name:score"`
- **Solo Games**: `"player_name:status:score"`

## 🤖 GenLayer-Specific Features

This project demonstrates full integration with GenLayer's unique capabilities:

### 1. LLM Integration 🧠
- **AI-Generated Car Descriptions**: Use `generate_car_description()` to create unique, dynamic car descriptions using GenLayer's LLM
- **AI Game Commentary**: Auto-generate exciting commentary for game events with `generate_ai_commentary()`
- **Dynamic Content**: All descriptions and commentary are generated in real-time by the LLM

```python
# Generate car description using LLM with leader/validator pattern
@gl.public.write
def generate_car_description(self, car_type: str):
    def leader_fn():
        prompt = f"Generate a brief description for a {car_type} racing car..."
        return gl.nondet.exec_prompt(prompt)
    
    def validator_fn(leader_result):
        if not isinstance(leader_result, gl.vm.Return):
            return False
        desc = leader_result.calldata
        return isinstance(desc, str) and 0 < len(desc) <= 200
    
    description = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
    self.car_descriptions = car_type + ":" + description

# Generate AI commentary using LLM consensus
@gl.public.write  
def generate_ai_commentary(self, player_name: str, score: str, action: str):
    def leader_fn():
        prompt = f"Generate commentary for player {player_name} who scored {score}..."
        return gl.nondet.exec_prompt(prompt)
    
    def validator_fn(leader_result):
        if not isinstance(leader_result, gl.vm.Return):
            return False
        commentary = leader_result.calldata
        return isinstance(commentary, str) and 0 < len(commentary) <= 150
    
    commentary = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
    self.ai_commentary = player_name + ":" + score + ":" + commentary
```

### 2. Web Fetching 🌐
- **Real-Time Weather Data**: Fetch live weather conditions from external APIs using `fetch_weather_conditions()`
- **Car Statistics**: Pull real car data from Wikipedia using `fetch_car_stats()`
- **Dynamic Game Mechanics**: Weather affects game difficulty (rain = slippery roads, etc.)

```python
# Fetch weather data using web.get with leader/validator pattern
@gl.public.write
def fetch_weather_conditions(self, city: str):
    def leader_fn():
        weather_url = f"https://wttr.in/{city}?format=%C+%t"
        return gl.nondet.web.get(weather_url, mode="text")
    
    def validator_fn(leader_result):
        if not isinstance(leader_result, gl.vm.Return):
            return False
        weather = leader_result.calldata
        return isinstance(weather, str) and len(weather.strip()) > 0
    
    weather_data = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
    
    # Parse weather for game effects
    weather_lower = weather_data.lower()
    if "rain" in weather_lower:
        self.current_weather = "rainy"
    elif "snow" in weather_lower:
        self.current_weather = "snowy"
    elif "cloud" in weather_lower:
        self.current_weather = "cloudy"
    else:
        self.current_weather = "sunny"

# Fetch car statistics from Wikipedia
@gl.public.write
def fetch_car_stats(self, car_model: str):
    def leader_fn():
        stats_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{car_model}"
        return gl.nondet.web.get(stats_url, mode="text")
    
    def validator_fn(leader_result):
        if not isinstance(leader_result, gl.vm.Return):
            return False
        stats = leader_result.calldata
        return isinstance(stats, str) and len(stats.strip()) > 0
    
    car_data = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
    self.car_descriptions = car_model + ":stats:" + str(car_data)[:200]
```

### 3. Equivalence Principle ⚖️
- **Deterministic Difficulty Calculation**: `calculate_game_difficulty()` uses mathematical operations that produce consistent results across different LLMs
- **Score Fairness Validation**: `validate_score_fairness()` ensures scores are within reasonable bounds using deterministic rules
- **Game Recommendations**: `get_game_recommendation()` provides consistent recommendations using structured logic

```python
# Calculate game difficulty (equivalent across LLMs)
@gl.public.view
def calculate_game_difficulty(self, score: str, weather: str):
    score_num = int(score) if score.isdigit() else 0
    weather_multipliers = {"sunny": 1.0, "rainy": 1.3, "cloudy": 1.1, "snowy": 1.5}
    # Deterministic calculation...
    return str(round(final_difficulty, 2))

# Validate score fairness
@gl.public.view
def validate_score_fairness(self, player_name: str, score: str, game_time: str):
    # Maximum possible score per second (equivalent calculation)
    max_score_per_second = 10
    max_possible_score = time_num * max_score_per_second
    # Check if score is within reasonable bounds...
    return "valid" or "invalid:..."

# Get game recommendation
@gl.public.view
def get_game_recommendation(self, player_score: str):
    # Structured, deterministic recommendation logic
    if score < 100:
        return "Practice mode recommended"
    elif score < 500:
        return "Ready for multiplayer"
    # ...
```

### How to Use GenLayer Features

1. **Connect Wallet**: First connect your wallet to enable GenLayer features
2. **Fetch Weather**: Enter a city name and click the globe icon to fetch real-time weather
3. **Generate Car Description**: Enter a car type and click the sparkles icon for AI-generated description
4. **Play Game**: Complete a game to automatically generate AI commentary and recommendations
5. **View Difficulty**: Game difficulty is automatically calculated based on your score and weather conditions

## 🌐 Deployment Instructions

### Option 1: Vercel (Recommended)
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/road-survival.git
git push -u origin main

# 2. Deploy to Vercel
# - Go to vercel.com
# - Connect GitHub repo
# - Auto-deploy
```

### Option 2: Netlify
```bash
# 1. Build project
npm run build

# 2. Deploy dist/ folder to Netlify
# Drag and drop or connect GitHub
```

### Option 3: Custom Server
```bash
# 1. Build for production
npm run build

# 2. Serve with any static server
serve -s dist -l 3000
```

## 🔧 Configuration

### Environment Variables
```javascript
// src/App.jsx
const CONTRACT_ADDRESS = "0xe57698b060FDB0B69554a3864558D11a4c03F071";
const WS_URL = "http://localhost:3001";
```

### WebSocket Server (Optional)
```bash
# Install dependencies for server
npm install express socket.io

# Start server
npm run server
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#0ea5e9 → #0284c7)
- **Secondary**: Purple gradient (#d946ef → #c026d3)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Game Font**: Press Start 2P (retro gaming)
- **UI Font**: JetBrains Mono (developer aesthetic)
- **System**: System UI (fallback)

### Animations
- **Float**: 3s ease-in-out infinite
- **Glow**: 2s ease-in-out infinite alternate
- **Slide**: 0.3s ease-out
- **Fade**: 0.5s ease-out

## 📱 Mobile Support

### Responsive Design
- **Desktop**: Full 12-column grid layout
- **Tablet**: 8-column grid with adjusted spacing
- **Mobile**: Single column, touch-friendly controls

## 🚀 Production Checklist

### ✅ Before Deploy
- [ ] Deploy contract to GenLayer mainnet
- [ ] Update CONTRACT_ADDRESS in src/App.jsx
- [ ] Test all game functionality
- [ ] Verify responsive design
- [ ] Check performance optimization

### ✅ After Deploy
- [ ] Test contract integration
- [ ] Verify WebSocket connections
- [ ] Monitor error logs
- [ ] Check mobile compatibility

## 🎯 Next Steps

1. **Deploy Contract** to GenLayer mainnet
2. **Update Address** in src/App.jsx
3. **Choose Platform** (Vercel recommended)
4. **Deploy Website**
5. **Test Production** environment
6. **Share with Players!**

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

MIT License - feel free to use for commercial projects

---

**🎮 Ready to Race? Deploy the contract, update the address, and start playing!**
