# config.py
import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()
OLLAMA_URL = "http://172.22.124.89:11434/api/generate"
MODEL = "gemma3"

class Config:
    # --- Model Configuration ---
    MODEL_NAME = "ministral-3:3b-cloud"  # Local Ollama model
    TEMPERATURE = 0
    OLLAMA_BASE_URL = "http://172.22.124.89:11434/api/generate"
    
    # --- API Keys ---
    # Ensure these are set in your .env file
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    
    # --- Phase 1: Budget & Constraints ---
    # These values define the 'Guard Layer' limits
    MAX_TOKENS_PER_QUERY = 5000 
    MAX_ITERATIONS_DEEP_MODE = 3  # Max loops for research
    CONFIDENCE_THRESHOLD = 0.8    # Minimum confidence to stop deep research
    
    # --- Path Configuration ---
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    QDRANT_PATH = os.path.join(BASE_DIR, "qdrant_db")
    OUTPUT_DIR = os.path.join(BASE_DIR, "output")

    @staticmethod
    def validate():
        """Ensure critical config is present."""
        if not Config.TAVILY_API_KEY:
            print("⚠️ Warning: TAVILY_API_KEY not found. Falling back to DuckDuckGo.")
            
# Create directories if they don't exist
os.makedirs(Config.QDRANT_PATH, exist_ok=True)
os.makedirs(Config.OUTPUT_DIR, exist_ok=True)