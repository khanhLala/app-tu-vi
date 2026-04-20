# -*- coding: utf-8 -*-
"""
chat_service.py — RAG + Gemini chatbot cho Tử Vi App

Luồng xử lý mỗi request:
1. Nhận câu hỏi + lịch sử hội thoại + context lá số (ai_prompt)
2. Tìm các chunk liên quan từ knowledge_base.json (keyword search)
3. Ghép system_prompt = vai trò + knowledge chunks + context lá số
4. Gọi Gemini API với toàn bộ lịch sử hội thoại
5. Trả về câu trả lời
"""
import os
import sys
import json
import re

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

import google.generativeai as genai
from dotenv import load_dotenv

# Load biến môi trường từ .env cùng thư mục
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# ── Cấu hình Gemini ───────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL   = "gemini-1.5-flash"   # Miễn phí, nhanh

# ── Đường dẫn knowledge base ─────────────────────────────────────────────────
KB_PATH = os.path.join(os.path.dirname(__file__), "knowledge", "knowledge_base.json")

# ── Cache knowledge base vào memory (chỉ load 1 lần khi khởi động) ───────────
_kb_cache: dict | None = None

def _load_kb() -> dict:
    """Load knowledge base vào memory, cache lại để tái sử dụng."""
    global _kb_cache
    if _kb_cache is None:
        if not os.path.exists(KB_PATH):
            raise FileNotFoundError(f"Knowledge base không tìm thấy: {KB_PATH}")
        with open(KB_PATH, encoding="utf-8") as f:
            _kb_cache = json.load(f)
    return _kb_cache


# ── Map keyword → topic name (dùng để parse câu hỏi) ────────────────────────
KEYWORD_TOPIC_MAP = {
    # Chính tinh
    "tử vi": "chinh_tinh", "thiên phủ": "chinh_tinh", "thái dương": "chinh_tinh",
    "thái âm": "chinh_tinh", "tham lang": "chinh_tinh", "cự môn": "chinh_tinh",
    "thiên tướng": "chinh_tinh", "thiên lương": "chinh_tinh", "thất sát": "chinh_tinh",
    "phá quân": "chinh_tinh", "liêm trinh": "chinh_tinh", "vũ khúc": "chinh_tinh",
    "thiên đồng": "chinh_tinh", "thiên cơ": "chinh_tinh", "chính tinh": "chinh_tinh",
    # Phụ tinh cát
    "tả phù": "phu_tinh_cat", "hữu bật": "phu_tinh_cat", "văn khúc": "phu_tinh_cat",
    "văn xương": "phu_tinh_cat", "thiên khôi": "phu_tinh_cat", "thiên việt": "phu_tinh_cat",
    "lộc tồn": "phu_tinh_cat", "thiên mã": "phu_tinh_cat", "hóa lộc": "phu_tinh_cat",
    "hóa quyền": "phu_tinh_cat", "hóa khoa": "phu_tinh_cat", "cát tinh": "phu_tinh_cat",
    # Phụ tinh hung
    "kình dương": "phu_tinh_hung", "đà la": "phu_tinh_hung", "hỏa tinh": "phu_tinh_hung",
    "linh tinh": "phu_tinh_hung", "địa kiếp": "phu_tinh_hung", "địa không": "phu_tinh_hung",
    "tứ sát": "phu_tinh_hung", "hóa kị": "phu_tinh_hung", "hung tinh": "phu_tinh_hung",
    # 12 cung
    "cung mệnh": "cung_menh", "mệnh": "cung_menh", "tính cách": "cung_menh",
    "phụ mẫu": "cung_phu_mau", "cha mẹ": "cung_phu_mau",
    "phúc đức": "cung_phuc_duc", "tâm linh": "cung_phuc_duc",
    "điền trạch": "cung_dien_trach", "nhà cửa": "cung_dien_trach", "đất đai": "cung_dien_trach",
    "quan lộc": "cung_quan_loc", "sự nghiệp": "cung_quan_loc", "công việc": "cung_quan_loc",
    "nô bộc": "cung_no_boc", "bạn bè": "cung_no_boc", "đồng nghiệp": "cung_no_boc",
    "thiên di": "cung_thien_di", "xuất ngoại": "cung_thien_di", "đi xa": "cung_thien_di",
    "tật ách": "cung_tat_ach", "bệnh tật": "cung_tat_ach", "sức khỏe": "cung_tat_ach",
    "tài bạch": "cung_tai_bach", "tiền tài": "cung_tai_bach", "tài lộc": "cung_tai_bach",
    "tử tức": "cung_tu_tuc", "con cái": "cung_tu_tuc",
    "phu thê": "cung_phu_the", "hôn nhân": "cung_phu_the", "vợ chồng": "cung_phu_the",
    "huynh đệ": "cung_huynh_de", "anh chị em": "cung_huynh_de",
    # Vận hạn
    "đại hạn": "dai_han_tieu_han", "tiểu hạn": "dai_han_tieu_han",
    "vận hạn": "dai_han_tieu_han", "lưu niên": "dai_han_tieu_han",
    # Khác
    "bản mệnh": "cu_menh_than", "mệnh chủ": "cu_menh_than",
    "ngũ hành": "ngu_hanh_cuc", "cục": "ngu_hanh_cuc",
    "can chi": "am_duong_can_chi", "âm dương": "am_duong_can_chi",
    "tam hợp": "tam_hop_nhi_hop", "nhị hợp": "tam_hop_nhi_hop", "xung chiếu": "tam_hop_nhi_hop",
    "miếu": "mieu_vuong_ham", "vượng": "mieu_vuong_ham", "hãm": "mieu_vuong_ham",
}


def _detect_topics(text: str) -> list[str]:
    """
    Phát hiện các chủ đề liên quan từ câu hỏi dựa trên keyword matching.
    Trả về list topic names (unique, giữ thứ tự xuất hiện).
    """
    text_lower = text.lower()
    seen = set()
    topics = []
    for kw, topic in KEYWORD_TOPIC_MAP.items():
        if kw in text_lower and topic not in seen:
            topics.append(topic)
            seen.add(topic)
    return topics if topics else ["chinh_tinh"]  # fallback: chính tinh


def retrieve_relevant_chunks(query: str, top_k: int = 5) -> list[str]:
    """
    Tìm top_k chunks liên quan nhất với câu hỏi.
    Dùng keyword topic matching + simple keyword scoring.
    """
    kb = _load_kb()
    topics = _detect_topics(query)
    query_lower = query.lower()

    # Lấy candidates từ topic_index
    candidate_indices = set()
    for topic in topics:
        indices = kb["topic_index"].get(topic, [])
        candidate_indices.update(indices[:80])  # Tối đa 80 chunk/topic

    if not candidate_indices:
        # Fallback: lấy 80 chunk đầu
        candidate_indices = set(range(min(80, len(kb["chunks"]))))

    # Score từng candidate chunk dựa trên keyword overlap
    scored = []
    query_words = set(re.findall(r'\w+', query_lower))

    for idx in candidate_indices:
        chunk = kb["chunks"][idx]
        chunk_lower = chunk["text"].lower()
        chunk_words = set(re.findall(r'\w+', chunk_lower))

        # Điểm = số từ query xuất hiện trong chunk
        overlap = len(query_words & chunk_words)
        # Bonus nếu chunk thuộc nhiều topic liên quan
        topic_bonus = len(set(chunk["topics"]) & set(topics))
        score = overlap + topic_bonus * 2

        if score > 0:
            scored.append((score, idx))

    # Sắp xếp và lấy top_k
    scored.sort(key=lambda x: -x[0])
    top_chunks = [kb["chunks"][idx]["text"] for _, idx in scored[:top_k]]

    return top_chunks


def _build_system_prompt(chart_prompt: str, knowledge_chunks: list[str]) -> str:
    """
    Xây dựng system prompt hoàn chỉnh cho Gemini.
    Bao gồm: vai trò + tài liệu tham khảo + context lá số (nếu có).
    """
    lines = [
        "Bạn là một thầy tử vi có 30 năm kinh nghiệm, am hiểu Tử Vi Đẩu Số theo trường phái Nam Phái.",
        "Hãy trả lời bằng tiếng Việt, lịch sự, dễ hiểu. Phân tích dựa trên kiến thức tử vi, không phán đoán mê tín.",
        "Khi không chắc chắn, hãy nói rõ đây là cách luận giải phổ biến.",
        "",
    ]

    # Thêm tài liệu tham khảo nếu có
    if knowledge_chunks:
        lines.append("=== TÀI LIỆU THAM KHẢO (trích từ sách Tử Vi) ===")
        for i, chunk in enumerate(knowledge_chunks, 1):
            lines.append(f"[Tài liệu {i}]")
            lines.append(chunk.strip())
            lines.append("")
        lines.append("=== HẾT TÀI LIỆU ===")
        lines.append("")

    # Thêm context lá số nếu có
    if chart_prompt and chart_prompt.strip():
        lines.append("=== LÁ SỐ CỦA NGƯỜI DÙNG ===")
        lines.append(chart_prompt.strip())
        lines.append("=== HẾT LÁ SỐ ===")
        lines.append("")
        lines.append("Hãy dựa vào lá số trên để trả lời các câu hỏi của người dùng.")

    return "\n".join(lines)


def chat(
    message: str,
    history: list[dict],
    chart_prompt: str = ""
) -> str:
    """
    Hàm chính: nhận câu hỏi, trả về câu trả lời từ Gemini.

    Args:
        message:      Câu hỏi hiện tại của user
        history:      Lịch sử chat [{"role": "user"/"model", "parts": "..."}]
        chart_prompt: ai_prompt từ lá số (chuỗi mô tả 12 cung)

    Returns:
        Chuỗi trả lời từ Gemini
    """
    if not GEMINI_API_KEY:
        raise ValueError("Chưa cấu hình GEMINI_API_KEY trong file .env")

    # 1. Cấu hình API key
    genai.configure(api_key=GEMINI_API_KEY)

    # 2. Tìm chunks liên quan
    # Kết hợp câu hỏi hiện tại + tin nhắn cuối trong history để search tốt hơn
    search_query = message
    if history:
        last_user = next((h["parts"] for h in reversed(history) if h["role"] == "user"), "")
        search_query = f"{last_user} {message}"
    knowledge_chunks = retrieve_relevant_chunks(search_query, top_k=5)

    # 3. Xây dựng system prompt
    system_prompt = _build_system_prompt(chart_prompt, knowledge_chunks)

    # 4. Khởi tạo model với system instruction
    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=system_prompt,
        generation_config={
            "temperature": 0.7,
            "max_output_tokens": 2048,
        }
    )

    # 5. Bắt đầu phiên chat với lịch sử
    # Gemini yêu cầu history có dạng [{"role": "user"/"model", "parts": ["text"]}]
    formatted_history = []
    for msg in history:
        formatted_history.append({
            "role": msg.get("role", "user"),
            "parts": [msg.get("parts", "")]
        })

    chat_session = model.start_chat(history=formatted_history)

    # 6. Gửi tin nhắn và lấy kết quả
    response = chat_session.send_message(message)
    return response.text
