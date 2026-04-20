# -*- coding: utf-8 -*-
"""
Script test nhanh chat_service.py — không cần chạy server FastAPI.
Chạy: python scripts/test_chat.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.stdout.reconfigure(encoding='utf-8')

from chat_service import retrieve_relevant_chunks, chat

print("=== TEST 1: Keyword retrieval ===")
query = "Sao Tử Vi ở cung Mệnh có ý nghĩa gì?"
chunks = retrieve_relevant_chunks(query, top_k=3)
print(f"Query: {query}")
print(f"Tìm được {len(chunks)} chunks:\n")
for i, c in enumerate(chunks, 1):
    print(f"[Chunk {i}] {c[:200]}...\n")

print("\n=== TEST 2: Gọi Gemini (cần GEMINI_API_KEY trong .env) ===")
try:
    answer = chat(
        message="Sao Tử Vi ở cung Mệnh nói lên điều gì về tính cách?",
        history=[],
        chart_prompt=""
    )
    print("✅ Gemini trả lời:")
    print(answer[:500])
except ValueError as e:
    print(f"⚠️  Chưa có API key: {e}")
    print("→ Tạo file tuvi-python/.env với nội dung: GEMINI_API_KEY=your_key_here")
    print("→ Lấy key tại: https://aistudio.google.com/apikey")
except Exception as e:
    print(f"❌ Lỗi: {e}")
