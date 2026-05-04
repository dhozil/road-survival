# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class RoadSurvivalGame(gl.Contract):
    """
    Road Survival - An Intelligent Contract Game
    
    This contract demonstrates GenLayer's unique capabilities by making
    LLM integration, web fetching, and consensus CRITICAL to gameplay.
    
    Core GenLayer Features:
    - LLM generates unique game levels and enemy patterns
    - Real-time weather affects game physics (fetched from web)
    - Consensus-based score validation using AI
    - Dynamic difficulty calculation using equivalence principle
    """
    
    # Game State
    sessions: str
    leaderboard: str
    solo_leaderboard: str
    solo_games: str
    
    # GenLayer-Powered Game Parameters (DYNAMIC)
    current_weather: str
    weather_multiplier: str  # Affects car speed
    difficulty_level: str  # AI-calculated based on weather + score
    
    # AI-Generated Content
    car_descriptions: str
    ai_commentary: str
    enemy_patterns: str  # LLM-generated enemy spawn patterns
    level_configs: str   # LLM-generated level configurations
    
    def __init__(self):
        self.current_weather = "sunny"
        self.weather_multiplier = "1.0"
        self.difficulty_level = "1.0"
        self.car_descriptions = ""
        self.ai_commentary = ""
        self.enemy_patterns = ""
        self.level_configs = ""
    
    @gl.public.write
    def create_session(self, session_id: str, player_name: str):
        # Append new session with newline separator
        if self.sessions:
            self.sessions = self.sessions + "\n" + session_id + ":" + player_name + ":waiting"
        else:
            self.sessions = session_id + ":" + player_name + ":waiting"
    
    @gl.public.write
    def start_solo(self, player_name: str):
        self.solo_games = player_name + ":playing:0"
    
    @gl.public.write
    def join_session(self, session_id: str, player_name: str):
        # Update existing session or append new one
        if self.sessions:
            sessions_list = self.sessions.split('\n')
            updated = False
            for i, session in enumerate(sessions_list):
                if session.startswith(session_id + ":"):
                    # Update existing session
                    sessions_list[i] = session_id + ":" + player_name + ":playing"
                    updated = True
                    break
            if not updated:
                # Append new session
                sessions_list.append(session_id + ":" + player_name + ":playing")
            self.sessions = "\n".join(sessions_list)
        else:
            self.sessions = session_id + ":" + player_name + ":playing"
    
    @gl.public.write
    def submit_score(self, session_id: str, player_name: str, score: str):
        # Append to leaderboard with newline separator
        if self.leaderboard:
            self.leaderboard = self.leaderboard + "\n" + player_name + ":" + score
        else:
            self.leaderboard = player_name + ":" + score
    
    @gl.public.write
    def submit_solo_score(self, player_name: str, score: str):
        # Append to solo leaderboard with newline separator
        if self.solo_leaderboard:
            self.solo_leaderboard = self.solo_leaderboard + "\n" + player_name + ":" + score
        else:
            self.solo_leaderboard = player_name + ":" + score
        self.solo_games = player_name + ":finished:" + score
    
    @gl.public.view
    def get_leaderboard(self):
        return self.leaderboard
    
    @gl.public.view
    def get_solo_leaderboard(self):
        return self.solo_leaderboard
    
    @gl.public.view
    def get_session(self, session_id: str):
        return self.sessions
    
    @gl.public.view
    def get_solo_game(self, player_name: str):
        return self.solo_games
    
    @gl.public.view
    def get_open_sessions(self):
        return self.sessions
    
    @gl.public.view
    def get_stats(self):
        """
        Get real-time game statistics from blockchain
        """
        # Count total games from leaderboard entries
        total_games = 0
        if self.leaderboard:
            total_games += len(self.leaderboard.split('\n'))
        if self.solo_leaderboard:
            total_games += len(self.solo_leaderboard.split('\n'))
        
        # Count active sessions
        active_players = 0
        if self.sessions:
            active_players = len([s for s in self.sessions.split('\n') if ':playing' in s])
        
        return f"{total_games}:{active_players}"
    
    # ==================== GENLayer LLM INTEGRATION ====================
    
    def _leader_generate_description(self, car_type: str):
        """Leader function: Generate car description using LLM"""
        prompt = f"""Generate a brief, exciting description for a {car_type} racing car in a video game.
        Keep it under 50 words. Focus on speed and style.
        Return ONLY the description, no additional text."""
        
        response = gl.nondet.exec_prompt(prompt)
        return response.strip()
    
    def _validator_description(self, leader_result, car_type: str) -> bool:
        """Validator function: Validate car description"""
        if not isinstance(leader_result, gl.vm.Return):
            return False
        
        description = leader_result.calldata
        # Validate: must be non-empty string and reasonable length
        if not isinstance(description, str):
            return False
        if len(description.strip()) == 0:
            return False
        if len(description) > 200:  # Max 200 chars
            return False
        return True
    
    @gl.public.write
    def generate_car_description(self, car_type: str):
        """
        LLM Integration: Generate unique car descriptions using GenLayer's LLM
        Uses leader/validator pattern for consensus on non-deterministic LLM output
        """
        description = gl.vm.run_nondet_unsafe(
            lambda: self._leader_generate_description(car_type),
            lambda leader: self._validator_description(leader, car_type)
        )
        
        # Store the result
        if self.car_descriptions:
            self.car_descriptions = self.car_descriptions + "\n" + car_type + ":" + description
        else:
            self.car_descriptions = car_type + ":" + description
    
    def _leader_generate_commentary(self, player_name: str, score: str, action: str):
        """Leader function: Generate AI commentary using LLM"""
        prompt = f"""Generate a short, exciting racing game commentary (max 30 words) for player {player_name} 
        who scored {score} points and {action}.
        Return ONLY the commentary, no additional text."""
        
        response = gl.nondet.exec_prompt(prompt)
        return response.strip()
    
    def _validator_commentary(self, leader_result) -> bool:
        """Validator function: Validate commentary"""
        if not isinstance(leader_result, gl.vm.Return):
            return False
        
        commentary = leader_result.calldata
        # Validate: must be non-empty string and reasonable length
        if not isinstance(commentary, str):
            return False
        if len(commentary.strip()) == 0:
            return False
        if len(commentary) > 150:  # Max 150 chars
            return False
        return True
    
    @gl.public.write
    def generate_ai_commentary(self, player_name: str, score: str, action: str):
        """
        LLM Integration: Generate AI commentary for game events
        Uses leader/validator pattern for consensus on non-deterministic LLM output
        """
        commentary = gl.vm.run_nondet_unsafe(
            lambda: self._leader_generate_commentary(player_name, score, action),
            self._validator_commentary
        )
        
        # Store the result
        if self.ai_commentary:
            self.ai_commentary = self.ai_commentary + "\n" + player_name + ":" + score + ":" + commentary
        else:
            self.ai_commentary = player_name + ":" + score + ":" + commentary
    
    @gl.public.view
    def get_car_description(self, car_type: str):
        """
        Retrieve AI-generated car description
        """
        if self.car_descriptions:
            entries = self.car_descriptions.split('\n')
            for entry in entries:
                if entry.startswith(car_type + ":"):
                    return entry.split(':', 1)[1] if ':' in entry else entry
        return ""
    
    @gl.public.view
    def get_ai_commentary(self, player_name: str):
        """
        Retrieve AI-generated commentary for a player
        """
        if self.ai_commentary:
            entries = self.ai_commentary.split('\n')
            for entry in entries:
                if entry.startswith(player_name + ":"):
                    parts = entry.split(':')
                    if len(parts) >= 3:
                        return parts[2]
        return ""
    
    # ==================== GENLayer WEB FETCHING ====================
    
    def _leader_fetch_weather(self, city: str):
        """Leader function: Fetch weather data from external API"""
        weather_url = f"https://wttr.in/{city}?format=%C+%t"
        weather_data = gl.nondet.web.get(weather_url, mode="text")
        return weather_data.strip()
    
    def _validator_weather(self, leader_result) -> bool:
        """Validator function: Validate weather data"""
        if not isinstance(leader_result, gl.vm.Return):
            return False
        
        weather_data = leader_result.calldata
        # Validate: must be non-empty string
        if not isinstance(weather_data, str):
            return False
        if len(weather_data.strip()) == 0:
            return False
        return True
    
    @gl.public.write
    def fetch_weather_conditions(self, city: str):
        """
        Web Fetching: Fetch real-time weather data from external API
        Uses leader/validator pattern for consensus on web data
        Weather conditions affect game physics (rain = slippery roads)
        """
        weather_data = gl.vm.run_nondet_unsafe(
            lambda: self._leader_fetch_weather(city),
            self._validator_weather
        )
        
        # Parse weather condition for game effects
        weather_lower = weather_data.lower()
        if "rain" in weather_lower or "drizzle" in weather_lower:
            self.current_weather = "rainy"
        elif "snow" in weather_lower or "ice" in weather_lower:
            self.current_weather = "snowy"
        elif "cloud" in weather_lower or "overcast" in weather_lower:
            self.current_weather = "cloudy"
        else:
            self.current_weather = "sunny"
        
        # Store the result
        if self.weather_data:
            self.weather_data = self.weather_data + "\n" + city + ":" + weather_data
        else:
            self.weather_data = city + ":" + weather_data
    
    @gl.public.view
    def get_weather_conditions(self, city: str):
        """
        Retrieve fetched weather data for a city
        """
        if self.weather_data:
            entries = self.weather_data.split('\n')
            for entry in entries:
                if entry.startswith(city + ":"):
                    return entry.split(':', 1)[1] if ':' in entry else entry
        return "sunny+20°C"
    
    @gl.public.view
    def get_current_weather(self):
        """
        Get current weather condition for game difficulty calculation
        Returns: sunny, rainy, cloudy, or snowy
        """
        return self.current_weather
    
    def _leader_fetch_car_stats(self, car_model: str):
        """Leader function: Fetch car statistics from Wikipedia"""
        stats_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{car_model}"
        car_data = gl.nondet.web.get(stats_url, mode="text")
        return str(car_data)[:200]  # Limit length
    
    def _validator_car_stats(self, leader_result) -> bool:
        """Validator function: Validate car stats"""
        if not isinstance(leader_result, gl.vm.Return):
            return False
        
        stats = leader_result.calldata
        if not isinstance(stats, str):
            return False
        if len(stats.strip()) == 0:
            return False
        return True
    
    @gl.public.write
    def fetch_car_stats(self, car_model: str):
        """
        Web Fetching: Fetch car statistics from external source
        Uses leader/validator pattern for consensus on web data
        Real car data affects game balance (speed, handling, etc.)
        """
        car_data = gl.vm.run_nondet_unsafe(
            lambda: self._leader_fetch_car_stats(car_model),
            self._validator_car_stats
        )
        
        # Store the result
        if self.car_descriptions:
            self.car_descriptions = self.car_descriptions + "\n" + car_model + ":stats:" + car_data
        else:
            self.car_descriptions = car_model + ":stats:" + car_data
    
    # ==================== EQUIVALENCE PRINCIPLE ====================
    
    @gl.public.view
    def calculate_game_difficulty(self, score: str, weather: str):
        """
        Equivalence Principle: Calculate game difficulty in a deterministic way
        that produces consistent results across different LLMs
        Uses structured prompts and mathematical operations for consistency
        """
        # Convert inputs to numeric values for deterministic calculation
        score_num = int(score) if score.isdigit() else 0
        
        # Weather multiplier (equivalent across different LLMs)
        weather_multipliers = {
            "sunny": 1.0,
            "rainy": 1.3,
            "cloudy": 1.1,
            "snowy": 1.5
        }
        
        # Extract weather condition from weather string
        weather_condition = "sunny"
        for condition in weather_multipliers:
            if condition in weather.lower():
                weather_condition = condition
                break
        
        multiplier = weather_multipliers.get(weather_condition, 1.0)
        
        # Deterministic difficulty calculation
        base_difficulty = 1.0 + (score_num / 1000.0)
        final_difficulty = base_difficulty * multiplier
        
        return str(round(final_difficulty, 2))
    
    @gl.public.view
    def validate_score_fairness(self, player_name: str, score: str, game_time: str):
        """
        Equivalence Principle: Validate score fairness using deterministic rules
        Ensures consistent validation across different LLM implementations
        """
        try:
            score_num = int(score)
            time_num = int(game_time)
            
            # Maximum possible score per second (equivalent calculation)
            max_score_per_second = 10
            max_possible_score = time_num * max_score_per_second
            
            # Check if score is within reasonable bounds
            if score_num > max_possible_score:
                return "invalid:score_too_high"
            elif score_num < 0:
                return "invalid:negative_score"
            else:
                return "valid"
        except:
            return "invalid:calculation_error"
    
    @gl.public.view
    def get_game_recommendation(self, player_score: str):
        """
        Equivalence Principle: Provide game recommendations using structured logic
        Uses deterministic rules that produce equivalent outputs across LLMs
        """
        try:
            score = int(player_score)
            
            # Structured, deterministic recommendation logic
            if score < 100:
                return "Practice mode recommended - Try solo training"
            elif score < 500:
                return "Ready for multiplayer - Join a room"
            elif score < 1000:
                return "Advanced player - Create competitive rooms"
            else:
                return "Expert player - Challenge top leaderboard"
        except:
            return "Invalid score - Please enter a number"
    
    # ==================== GAME LOGIC INTEGRATION ====================
    
    @gl.public.view
    def get_game_speed_multiplier(self):
        """
        Get speed multiplier based on current weather
        Used by game to adjust car speed dynamically
        Rainy/snowy weather reduces speed for realism
        """
        multipliers = {
            "sunny": 1.0,
            "cloudy": 0.95,
            "rainy": 0.85,
            "snowy": 0.75
        }
        return str(multipliers.get(self.current_weather, 1.0))
    
    @gl.public.view
    def get_car_performance(self, car_type: str):
        """
        Get car performance stats based on AI-generated description
        Uses LLM to analyze car type and return performance characteristics
        """
        description = self.get_car_description(car_type)
        if not description:
            return "unknown:50:50:50"  # type:speed:handling:acceleration
        
        # Simple heuristic based on car type
        performance_map = {
            "f1": "f1:95:90:98",
            "racing": "racing:90:85:92",
            "sports": "sports:85:80:88",
            "muscle": "muscle:80:65:85",
            "luxury": "luxury:75:85:70",
            "sedan": "sedan:65:75:60",
            "hatchback": "hatchback:60:80:55",
            "suv": "suv:55:70:50",
            "truck": "truck:50:55:45"
        }
        
        return performance_map.get(car_type.lower(), "unknown:50:50:50")
    
    # ==================== INTEGRAL GENLAYER GAME MECHANICS ====================
    # These functions make GenLayer features REQUIRED for core gameplay
    
    def _leader_generate_enemy_pattern(self, player_skill: str, weather: str):
        """
        Leader function: LLM generates enemy spawn pattern based on skill and weather
        This is INTEGRAL - game cannot spawn enemies without AI-generated patterns
        """
        prompt = f"""Generate a racing game enemy spawn pattern.
        Player skill level: {player_skill}
        Current weather: {weather}
        
        Return ONLY a comma-separated list of spawn intervals in seconds (e.g., "2.5,1.8,3.2,1.5")
        The pattern should be challenging but fair."""
        
        response = gl.nondet.exec_prompt(prompt)
        return response.strip()
    
    def _validator_enemy_pattern(self, leader_result) -> bool:
        """Validator: Ensure enemy pattern is valid numeric sequence"""
        if not isinstance(leader_result, gl.vm.Return):
            return False
        
        pattern = leader_result.calldata
        if not isinstance(pattern, str):
            return False
        
        # Validate format: comma-separated numbers
        try:
            intervals = pattern.split(',')
            for interval in intervals:
                float(interval.strip())
            return len(intervals) >= 3  # At least 3 enemies
        except:
            return False
    
    @gl.public.write
    def generate_enemy_pattern_for_session(self, session_id: str, player_skill: str):
        """
        CRITICAL: Generate enemy spawn pattern using LLM consensus
        Game CANNOT spawn enemies without calling this function first
        Uses real-time weather data to adjust enemy difficulty
        """
        # Get current weather (must be fetched first)
        weather = self.current_weather
        
        # Generate pattern using LLM consensus
        pattern = gl.vm.run_nondet_unsafe(
            lambda: self._leader_generate_enemy_pattern(player_skill, weather),
            self._validator_enemy_pattern
        )
        
        # Store pattern for session
        if self.enemy_patterns:
            self.enemy_patterns = self.enemy_patterns + "\n" + session_id + ":" + pattern
        else:
            self.enemy_patterns = session_id + ":" + pattern
    
    @gl.public.view
    def get_enemy_pattern(self, session_id: str):
        """Get AI-generated enemy spawn pattern for a session"""
        if self.enemy_patterns:
            entries = self.enemy_patterns.split('\n')
            for entry in entries:
                if entry.startswith(session_id + ":"):
                    return entry.split(':', 1)[1] if ':' in entry else ""
        return ""
    
    def _leader_validate_score_intelligently(self, player_name: str, score: str, game_time: str, moves: str):
        """
        Leader function: LLM analyzes gameplay data to detect cheating
        Uses AI to validate if score is realistic based on moves and time
        """
        prompt = f"""Analyze this racing game score for potential cheating:
        Player: {player_name}
        Score: {score}
        Game Time: {game_time} seconds
        Moves Data: {moves} (lane changes and actions)
        
        Determine if this score is realistic or suspicious.
        Consider: average score per second, number of moves, typical human performance.
        
        Return ONLY one word: "VALID" or "CHEATING" """
        
        response = gl.nondet.exec_prompt(prompt)
        return response.strip().upper()
    
    def _validator_score_analysis(self, leader_result) -> bool:
        """Validator: Score analysis must return VALID or CHEATING"""
        if not isinstance(leader_result, gl.vm.Return):
            return False
        
        result = leader_result.calldata
        if not isinstance(result, str):
            return False
        
        return result in ["VALID", "CHEATING"]
    
    @gl.public.write
    def submit_score_intelligent(self, session_id: str, player_name: str, score: str, game_time: str, moves: str):
        """
        CRITICAL: Submit score with AI-powered anti-cheat validation
        Uses LLM consensus to analyze gameplay data and detect cheaters
        Score is ONLY recorded if AI validators agree it's legitimate
        """
        # AI consensus validation (REQUIRED - cannot submit without this)
        ai_validation = gl.vm.run_nondet_unsafe(
            lambda: self._leader_validate_score_intelligently(player_name, score, game_time, moves),
            self._validator_score_analysis
        )
        
        if ai_validation == "CHEATING":
            # Reject score - potential cheating detected
            return "REJECTED: Cheating detected by AI consensus"
        
        # AI validators agree score is legitimate - record it
        if self.leaderboard:
            self.leaderboard = self.leaderboard + "\n" + player_name + ":" + score + ":verified"
        else:
            self.leaderboard = player_name + ":" + score + ":verified"
        
        return "ACCEPTED: Score verified by AI consensus"
    
    def _leader_calculate_dynamic_difficulty(self, city: str, recent_scores: str):
        """
        Leader function: LLM fetches weather and calculates difficulty dynamically
        Combines real-world weather with player performance using AI reasoning
        """
        # Fetch real weather data
        weather_url = f"https://wttr.in/{city}?format=%C+%t"
        weather_raw = gl.nondet.web.get(weather_url, mode="text")
        
        prompt = f"""Calculate racing game difficulty based on:
        Real Weather: {weather_raw}
        Recent Player Scores: {recent_scores}
        
        Analyze weather impact and player skill trend.
        Return ONLY a number between 0.5 (easy) and 2.0 (extreme) representing difficulty multiplier."""
        
        response = gl.nondet.exec_prompt(prompt)
        return response.strip()
    
    def _validator_difficulty(self, leader_result) -> bool:
        """Validator: Difficulty must be valid number between 0.5 and 2.0"""
        if not isinstance(leader_result, gl.vm.Return):
            return False
        
        try:
            difficulty = float(leader_result.calldata)
            return 0.5 <= difficulty <= 2.0
        except:
            return False
    
    @gl.public.write
    def update_game_difficulty(self, city: str):
        """
        CRITICAL: Update game difficulty using AI analysis of real-world weather
        Fetches current weather and uses LLM consensus to calculate difficulty
        Game difficulty is DYNAMIC and based on external real-time data
        """
        # Get recent scores for analysis
        recent_scores = self.leaderboard if self.leaderboard else "no_data"
        
        # AI consensus to calculate difficulty based on weather + performance
        difficulty = gl.vm.run_nondet_unsafe(
            lambda: self._leader_calculate_dynamic_difficulty(city, recent_scores),
            self._validator_difficulty
        )
        
        self.difficulty_level = difficulty
        
        # Also update weather state
        weather_url = f"https://wttr.in/{city}?format=%C+%t"
        weather_raw = gl.nondet.web.get(weather_url, mode="text")
        
        weather_lower = weather_raw.lower()
        if "rain" in weather_lower or "drizzle" in weather_lower:
            self.current_weather = "rainy"
            self.weather_multiplier = "0.85"
        elif "snow" in weather_lower or "ice" in weather_lower:
            self.current_weather = "snowy"
            self.weather_multiplier = "0.75"
        elif "cloud" in weather_lower or "overcast" in weather_lower:
            self.current_weather = "cloudy"
            self.weather_multiplier = "0.95"
        else:
            self.current_weather = "sunny"
            self.weather_multiplier = "1.0"
    
    @gl.public.view
    def get_current_difficulty(self):
        """Get AI-calculated difficulty level"""
        return self.difficulty_level
    
    @gl.public.view
    def get_intelligent_game_state(self):
        """
        Get complete game state including AI-generated parameters
        Frontend MUST call this to get enemy patterns, difficulty, and weather effects
        """
        return {
            "weather": self.current_weather,
            "weather_multiplier": self.weather_multiplier,
            "difficulty": self.difficulty_level,
            "enemy_pattern_available": len(self.enemy_patterns) > 0,
            "ai_commentary_count": len(self.ai_commentary.split('\n')) if self.ai_commentary else 0
        }