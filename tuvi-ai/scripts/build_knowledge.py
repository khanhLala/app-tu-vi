# -*- coding: utf-8 -*-
"""
Build knowledge_base.json từ các file PDF tài liệu Tử Vi.
File "Mệnh lý thiên cơ" và "Tử Vi Đầu Số Tân Biên" có text Unicode tốt nhất.
"""
import sys, os, json, re

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

import fitz

DOC_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "document", "Tử vi")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "knowledge")
os.makedirs(OUT_DIR, exist_ok=True)

# Chỉ dùng 2 file có Unicode tốt (file cũ bị lỗi font TCVN3)
GOOD_PDFS = {
    "menh_ly_thien_co": "Mệnh lý thiên cơ.pdf",
    "tan_bien":         "Tử Vi Đầu Số Tân Biên - Vân Đằng Thái Thứ Lang.pdf",
}

# ── Từ khoá phân loại chủ đề ──────────────────────────────────────────────
TOPIC_KEYWORDS = {
    "chinh_tinh": [
        "tử vi","thiên phủ","thái dương","thái âm","tham lang","cự môn",
        "thiên tướng","thiên lương","thất sát","phá quân","liêm trinh","vũ khúc",
        "thiên đồng","thiên cơ","chính tinh"
    ],
    "phu_tinh_cat": [
        "tả phù","hữu bật","văn khúc","văn xương","thiên khôi","thiên việt",
        "lộc tồn","thiên mã","hóa lộc","hóa quyền","hóa khoa","cát tinh","phụ tinh"
    ],
    "phu_tinh_hung": [
        "kình dương","đà la","hỏa tinh","linh tinh","địa kiếp","địa không",
        "tứ sát","hung tinh","thiên không","triệt lộ","tuần không"
    ],
    "cung_menh": [
        "cung mệnh","mệnh cung","an mệnh","chủ mệnh","mệnh chủ",
        "tính cách","ngoại hình","trí tuệ"
    ],
    "cung_phu_mau": [
        "phụ mẫu","cha mẹ","cung phụ","bề trên","tổ tiên"
    ],
    "cung_phuc_duc": [
        "phúc đức","phúc cung","phúc phần","phúc khí","tâm linh","dòng họ"
    ],
    "cung_dien_trach": [
        "điền trạch","nhà cửa","đất đai","bất động sản","gia sản","thừa kế"
    ],
    "cung_quan_loc": [
        "quan lộc","sự nghiệp","công việc","thăng tiến","danh vọng","chức vụ"
    ],
    "cung_no_boc": [
        "nô bộc","bạn bè","đồng nghiệp","thuộc cấp","cấp dưới","nhân viên"
    ],
    "cung_thien_di": [
        "thiên di","xuất ngoại","đi xa","di chuyển","ngoại giao","đối ngoại"
    ],
    "cung_tat_ach": [
        "tật ách","bệnh tật","tai nạn","sức khỏe","thương tật","ốm đau"
    ],
    "cung_tai_bach": [
        "tài bạch","tiền tài","tài chính","tài lộc","tiền bạc","thu nhập","kiếm tiền"
    ],
    "cung_tu_tuc": [
        "tử tức","con cái","con cháu","sinh con","vô tự","hiếm muộn"
    ],
    "cung_phu_the": [
        "phu thê","hôn nhân","vợ chồng","tình duyên","người phối ngẫu","phối ngẫu"
    ],
    "cung_huynh_de": [
        "huynh đệ","anh chị em","anh em","chị em","bằng hữu"
    ],
    "dai_han_tieu_han": [
        "đại hạn","tiểu hạn","vận hạn","lưu niên","lưu nguyệt","vận trình","hạn"
    ],
    "cu_menh_than": [
        "bản mệnh","mệnh chủ","thân chủ","an thân","cung thân","mệnh thân"
    ],
    "ngu_hanh_cuc": [
        "ngũ hành","thủy nhị cục","mộc tam cục","kim tứ cục","thổ ngũ cục","hỏa lục cục","lập cục","định cục"
    ],
    "am_duong_can_chi": [
        "can chi","thiên can","địa chi","âm dương","bát tự","tứ trụ","nạp âm","bản mệnh"
    ],
    "tam_hop_nhi_hop": [
        "tam hợp","nhị hợp","xung chiếu","lục hợp","hình khắc","chiếu","xung","hợp cục"
    ],
    "mieu_vuong_ham": [
        "miếu","vượng","hãm địa","đắc địa","bình hòa","thất hãm","nhập miếu","cường cung"
    ],
}

def is_mostly_unicode_viet(text: str) -> bool:
    """Kiểm tra text có phải Unicode tiếng Việt bình thường không (không bị lỗi font)."""
    viet_chars = set("àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ"
                     "ÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ")
    viet_count = sum(1 for c in text if c in viet_chars)
    return viet_count > len(text) * 0.03  # ≥3% là ký tự có dấu

def clean_text(text: str) -> str:
    text = re.sub(r'\n{3,}', '\n\n', text)
    lines = [l.strip() for l in text.splitlines() if len(l.strip()) > 3]
    return '\n'.join(lines)

def classify_topics(text: str) -> list:
    """Phân loại chunk thuộc các chủ đề nào."""
    text_lower = text.lower()
    topics = []
    for topic, keywords in TOPIC_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            topics.append(topic)
    return topics if topics else ["general"]

def extract_chunks_from_pdf(filepath: str, source_name: str) -> list:
    """Extract và chunk text từ PDF, trả về list chunk objects."""
    doc = fitz.open(filepath)
    total = len(doc)
    chunks = []
    buffer = ""
    buffer_start_page = 1
    CHUNK_SIZE = 800   # ký tự mỗi chunk

    for page_num in range(total):
        page = doc[page_num]
        text = clean_text(page.get_text("text"))

        if not text or not is_mostly_unicode_viet(text):
            continue  # bỏ trang bị lỗi font hoặc trống

        buffer += "\n" + text

        # Khi buffer đủ lớn → tạo chunk
        if len(buffer) >= CHUNK_SIZE:
            chunk_text = buffer.strip()
            topics = classify_topics(chunk_text)
            chunks.append({
                "id": f"{source_name}_p{buffer_start_page}",
                "source": source_name,
                "page_start": buffer_start_page,
                "page_end": page_num + 1,
                "topics": topics,
                "text": chunk_text[:1500]  # giới hạn độ dài chunk
            })
            buffer = ""
            buffer_start_page = page_num + 2

    # Chunk cuối
    if buffer.strip():
        chunks.append({
            "id": f"{source_name}_p{buffer_start_page}",
            "source": source_name,
            "page_start": buffer_start_page,
            "page_end": total,
            "topics": classify_topics(buffer),
            "text": buffer.strip()[:1500]
        })

    doc.close()
    return chunks

def build_knowledge_base():
    print("=" * 60)
    print("BUILD KNOWLEDGE BASE TỬ VI")
    print("=" * 60)

    all_chunks = []

    for source_name, filename in GOOD_PDFS.items():
        filepath = os.path.join(DOC_DIR, filename)
        if not os.path.exists(filepath):
            print(f"[SKIP] Không tìm thấy: {filename}")
            continue
        print(f"\n📄 Xử lý: {filename}")
        chunks = extract_chunks_from_pdf(filepath, source_name)
        print(f"   → Trích xuất được {len(chunks)} chunks")

        # Thống kê phân phối chủ đề
        topic_count = {}
        for c in chunks:
            for t in c["topics"]:
                topic_count[t] = topic_count.get(t, 0) + 1
        top5 = sorted(topic_count.items(), key=lambda x: -x[1])[:5]
        print(f"   → Top chủ đề: {top5}")

        all_chunks.extend(chunks)

    # ── Tạo index theo chủ đề ─────────────────────────────────────────────
    topic_index = {}
    for i, chunk in enumerate(all_chunks):
        for topic in chunk["topics"]:
            if topic not in topic_index:
                topic_index[topic] = []
            topic_index[topic].append(i)

    # ── Lưu knowledge base ────────────────────────────────────────────────
    kb = {
        "meta": {
            "total_chunks": len(all_chunks),
            "sources": list(GOOD_PDFS.keys()),
            "topics": list(TOPIC_KEYWORDS.keys()),
        },
        "topic_index": topic_index,
        "chunks": all_chunks
    }

    out_path = os.path.join(OUT_DIR, "knowledge_base.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(kb, f, ensure_ascii=False, indent=2)

    size_mb = os.path.getsize(out_path) / 1024 / 1024
    print(f"\n✅ Đã lưu: {out_path}")
    print(f"   Tổng chunks: {len(all_chunks)}")
    print(f"   Tổng chủ đề: {len(topic_index)}")
    print(f"   Kích thước file: {size_mb:.2f} MB")

if __name__ == "__main__":
    build_knowledge_base()
