# 🤖 tuvi-ai — AI Chatbot Luận Giải Lá Số Tử Vi

Microservice AI độc lập, cung cấp khả năng hỏi đáp và luận giải lá số Tử Vi thông minh bằng **Gemini API** kết hợp **Lexical RAG** từ kho kiến thức được xây dựng từ tài liệu PDF chuyên ngành.

---

## 📐 Kiến trúc tổng thể

```
tuvi-mobile (React Native)
       ↓  POST /api/v1/ai/chat  [JWT Token]
tuvi-backend (Spring Boot :8080)   ← kiểm tra JWT
       ↓  forward request
tuvi-ai (FastAPI :8001)            ← xử lý AI
       ↓
  [1] Tìm chunks liên quan trong knowledge_base.json (Lexical RAG)
  [2] Xây dựng system prompt = vai trò + tài liệu + context lá số
  [3] Gọi Gemini API
       ↓
  Trả về câu trả lời tiếng Việt
```

---

## 📁 Cấu trúc thư mục

```
tuvi-ai/
├── api.py                  # FastAPI entry point (port 8001)
├── chat_service.py         # Logic RAG + gọi Gemini API
├── requirements.txt        # Python dependencies
├── .env                    # Biến môi trường (KHÔNG commit)
├── .env.example            # Template cấu hình
│
├── knowledge/
│   └── knowledge_base.json # Kho 1227 chunks kiến thức Tử Vi (2.87MB)
│
└── scripts/
    ├── extract_pdf.py      # Trích xuất text từ PDF
    ├── build_knowledge.py  # Xây dựng knowledge base từ PDF
    ├── check_kb.py         # Kiểm tra nội dung knowledge base
    ├── verify_key.py       # Kiểm tra API key Gemini
    └── test_chat.py        # Test chat service không cần server
```

---

## ⚙️ Cài đặt & Chạy

### 1. Yêu cầu
- Python 3.10+
- Gemini API Key (lấy miễn phí tại [aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### 2. Cài đặt dependencies

```bash
cd tuvi-ai
pip install -r requirements.txt
```

### 3. Cấu hình môi trường

```bash
# Copy file mẫu
copy .env.example .env
```

Mở file `.env` và điền API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Kiểm tra API key hoạt động

```bash
python scripts/verify_key.py
```

### 5. Khởi động server

```bash
python api.py
# Server chạy tại: http://localhost:8001
# Docs tự động:    http://localhost:8001/docs
```

---

## 🔌 API Endpoints

### `POST /api/v1/chat`

Nhận câu hỏi, tìm kiếm tài liệu liên quan và trả lời qua Gemini.

**Request Body:**
```json
{
  "message": "Sao Tử Vi ở cung Mệnh có ý nghĩa gì?",
  "history": [
    { "role": "user",  "parts": "Câu hỏi trước" },
    { "role": "model", "parts": "Câu trả lời trước" }
  ],
  "chart_prompt": "--- THÔNG TIN LÁ SỐ ---\nHọ tên: Nguyễn Văn A\n[Mệnh] Cung Tý: Tử Vi, Thiên Phủ\n..."
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `message` | string | ✅ | Câu hỏi hiện tại |
| `history` | array | ❌ | Lịch sử hội thoại trước đó |
| `chart_prompt` | string | ❌ | Chuỗi mô tả lá số (từ `ai_prompt` của `tuvi-python`) |

**Response:**
```json
{
  "answer": "Sao Tử Vi tọa thủ cung Mệnh biểu thị...",
  "sources_used": 5
}
```

### `GET /api/v1/health`

Kiểm tra trạng thái service.

```json
{ "status": "UP", "service": "Tu Vi AI Service" }
```

---

## 🧠 Luồng xử lý RAG

```
Câu hỏi → Phát hiện chủ đề (keyword matching)
                ↓
         topic_index tra cứu candidates
                ↓
         Keyword overlap scoring → top 5 chunks
                ↓
         System prompt = vai trò + chunks + lá số
                ↓
         Gemini API (với lịch sử hội thoại)
                ↓
         Câu trả lời tiếng Việt
```

**21 chủ đề được nhận diện:**
`chinh_tinh`, `phu_tinh_cat`, `phu_tinh_hung`, `cung_menh`, `cung_tai_bach`, `cung_quan_loc`, `cung_phu_the`, `cung_tu_tuc`, `cung_huynh_de`, `cung_phu_mau`, `cung_no_boc`, `cung_thien_di`, `cung_tat_ach`, `cung_phuc_duc`, `cung_dien_trach`, `dai_han_tieu_han`, `ngu_hanh_cuc`, `am_duong_can_chi`, `tam_hop_nhi_hop`, `mieu_vuong_ham`, `cu_menh_than`

---

## 📚 Knowledge Base

| Thuộc tính | Giá trị |
|------------|---------|
| Nguồn | Mệnh Lý Thiên Cơ, Tử Vi Đầu Số Tân Biên |
| Tổng chunks | 1.227 |
| Kích thước | 2.87 MB |
| Độ dài mỗi chunk | ~800–1500 ký tự |

### Rebuild knowledge base từ PDF mới

```bash
# 1. Đặt file PDF vào: document/Tử vi/
# 2. Khảo sát nội dung PDF
python scripts/extract_pdf.py

# 3. Build lại knowledge base
python scripts/build_knowledge.py
```

> ⚠️ Chỉ rebuild khi cần thêm tài liệu mới. File `knowledge_base.json` đã có sẵn và commit vào repo.

---

## 🔧 Xử lý lỗi thường gặp

### `429 RESOURCE_EXHAUSTED` — Hết quota Gemini

```
limit: 0 — Quota exceeded for free tier
```

**Nguyên nhân & giải pháp:**

| Tình huống | Giải pháp |
|------------|-----------|
| Key mới tạo | Chờ 5–10 phút để kích hoạt |
| Hết quota phút (RPM) | Chờ 1 phút rồi thử lại |
| Hết quota ngày (RPD) | Chờ reset lúc 0h UTC hoặc tạo key mới |
| Key từ Google Cloud (có billing) | Tạo key tại **AI Studio** thay vì Cloud Console |

Chạy script kiểm tra:
```bash
python scripts/verify_key.py
```

### `ValueError: Chưa cấu hình GEMINI_API_KEY`

File `.env` chưa có key. Xem lại bước cài đặt.

### `FileNotFoundError: knowledge_base.json`

Chạy `python scripts/build_knowledge.py` để tạo lại.

---

## 🔗 Tích hợp với hệ thống

Service này được gọi bởi **tuvi-backend** (Spring Boot) thông qua `AiChatController.java`:

```
tuvi-backend/
└── src/main/java/.../controller/AiChatController.java
    → POST http://localhost:8001/api/v1/chat
```

Cấu hình URL trong `tuvi-backend/.env`:
```env
AI_SERVICE_URL=http://localhost:8001
```
