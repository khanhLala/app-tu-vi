import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model_id = "models/gemini-1.5-flash" # Use a standard model name

print(f"Testing Gemini with key: {api_key[:10]}...")

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
    import traceback
    traceback.print_exc()
