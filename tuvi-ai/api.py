# -*- coding: utf-8 -*-
"""
tuvi-ai/api.py — FastAPI riêng cho AI Chatbot Tử Vi
Port: 8001

Endpoint duy nhất: POST /api/v1/chat
"""
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import traceback

from chat_service import chat, retrieve_relevant_chunks
from google.genai.errors import ServerError, ClientError

app = FastAPI(
    title="Tử Vi AI Service",
    description="Microservice AI Chatbot luận giải lá số Tử Vi (RAG + Gemini)",
    version="1.0.0"
)


# ── Request / Response Models ─────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  = Field(..., description="'user' hoặc 'model'")
    parts: str = Field(..., description="Nội dung tin nhắn")

class ChatRequest(BaseModel):
    message: str = Field(..., description="Câu hỏi hiện tại của người dùng")
    history: Optional[List[ChatMessage]] = Field(
        default=[],
        description="Lịch sử hội thoại [{role, parts}]"
    )
    chart_prompt: Optional[str] = Field(
        default="",
        description="ai_prompt từ lá số (mô tả 12 cung, bát tự...)"
    )

class ChatResponse(BaseModel):
    answer: str
    sources_used: int


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/api/v1/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """
    AI Chatbot Tử Vi — RAG + Gemini.

    Luồng:
    1. Tìm chunks liên quan trong knowledge_base.json
    2. Ghép system_prompt = vai trò + chunks + context lá số
    3. Gọi Gemini với lịch sử hội thoại
    4. Trả về câu trả lời
    """
    try:
        history_dicts = [
            {"role": msg.role, "parts": msg.parts}
            for msg in (request.history or [])
        ]

        # Tìm chunks (để trả về metadata sources_used)
        search_query = request.message
        if history_dicts:
            last_user = next(
                (h["parts"] for h in reversed(history_dicts) if h["role"] == "user"), ""
            )
            search_query = f"{last_user} {request.message}"

        chunks = retrieve_relevant_chunks(search_query, top_k=5)

        answer = chat(
            message=request.message,
            history=history_dicts,
            chart_prompt=request.chart_prompt or ""
        )

        return ChatResponse(answer=answer, sources_used=len(chunks))

    except (ValueError, ServerError) as e:
        detail_msg = str(e)
        if "503" in detail_msg or "high demand" in detail_msg.lower():
            detail_msg = "Hệ thống AI đang quá tải. Vui lòng thử lại sau giây lát."
        raise HTTPException(status_code=503, detail=detail_msg)
    except ClientError as e:
        raise HTTPException(status_code=400, detail=f"Lỗi yêu cầu AI: {str(e)}")
    except Exception as e:
        print(">>> LỖI AI SERVER:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Lỗi AI: {str(e)}")


@app.get("/api/v1/health")
def health_check():
    return {"status": "UP", "service": "Tu Vi AI Service"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8001, reload=True)
