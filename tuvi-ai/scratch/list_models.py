import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

try:
    client = genai.Client(api_key=api_key)
    print("Listing available models:")
    for model in client.models.list():
        print(f" - {model.name} (Methods: {model.supported_generation_methods})")
except Exception as e:
    print(f"Error: {str(e)}")
