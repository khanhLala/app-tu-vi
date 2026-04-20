import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# In ra danh sách các model khả dụng
print("Danh sách model của bố Lâm đây:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)