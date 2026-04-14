# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class RoadSurvivalGame(gl.Contract):
    sessions: str
    leaderboard: str
    solo_leaderboard: str
    solo_games: str
    weather_data: str
    car_descriptions: str
    ai_commentary: str
    
    def __init__(self):
        self.weather_data = ""
        self.car_descriptions = ""
        self.ai_commentary = ""
        self.solo_leaderboard = ""
    
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
        return "stats"
    
    # ==================== GENLayer LLM INTEGRATION ====================
    
    @gl.public.write
    def generate_car_description(self, car_type: str):
        """
        LLM Integration: Generate unique car descriptions using GenLayer's LLM
        This demonstrates GenLayer's ability to integrate AI for dynamic content
        """
        prompt = f"""Generate a brief, exciting description for a {car_type} racing car in a video game.
        Keep it under 50 words. Focus on speed and style.
        Return ONLY the description, no additional text."""
        
        description = gl.llm(prompt)
        self.car_descriptions = car_type + ":" + description
    
    @gl.public.write
    def generate_ai_commentary(self, player_name: str, score: str, action: str):
        """
        LLM Integration: Generate AI commentary for game events
        Uses GenLayer's LLM to create dynamic, engaging game commentary
        """
        prompt = f"""Generate a short, exciting racing game commentary (max 30 words) for player {player_name} 
        who scored {score} points and {action}.
        Return ONLY the commentary, no additional text."""
        
        commentary = gl.llm(prompt)
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
    
    @gl.public.write
    def fetch_weather_conditions(self, city: str):
        """
        Web Fetching: Fetch real-time weather data from external API
        This demonstrates GenLayer's ability to fetch external web data
        Weather conditions can affect game physics (e.g., rain = slippery roads)
        """
        try:
            # Using a free weather API (wttr.in)
            weather_url = f"https://wttr.in/{city}?format=%C+%t"
            weather_data = gl.fetch(weather_url)
            self.weather_data = city + ":" + weather_data
        except Exception as e:
            self.weather_data = city + ":sunny+20°C"  # Fallback
    
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
    
    @gl.public.write
    def fetch_car_stats(self, car_model: str):
        """
        Web Fetching: Fetch car statistics from external source
        This can be used to balance game mechanics based on real car data
        """
        try:
            # Using a car API or Wikipedia for car stats
            # For demo, we'll use a structured approach
            stats_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{car_model}"
            car_data = gl.fetch(stats_url)
            self.car_descriptions = car_model + ":stats:" + str(car_data)[:200]  # Limit length
        except Exception as e:
            self.car_descriptions = car_model + ":stats:unknown"
    
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