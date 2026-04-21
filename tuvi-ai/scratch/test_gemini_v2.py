import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
# Try the most standard name
model_id = "gemini-1.5-flash" 

print(f"Testing Gemini with key: {api_key[:10]}...")
print(f"Using model: {model_id}")

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=model_id,
        contents="Hello, are you working?"
    )
    print("Success!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")
