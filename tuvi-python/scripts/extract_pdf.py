# -*- coding: utf-8 -*-
"""
Script khảo sát nội dung các file PDF tài liệu Tử Vi.
Chạy script này để xem cấu trúc và lấy mẫu nội dung trước khi build knowledge base.
"""
import sys
import os
import json
import re

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Thiếu thư viện PyMuPDF. Chạy: pip install pymupdf")
    sys.exit(1)

# Đường dẫn tới thư mục tài liệu
DOC_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "document", "Tử vi")

PDF_FILES = [
    "0. (Nền tảng) Tử vi hàm số.pdf",
    "1. (Nền tảng) Tử vi đẩu số toàn thư.pdf",
    "Mệnh lý thiên cơ.pdf",
    "Tử Vi Đầu Số Tân Biên - Vân Đằng Thái Thứ Lang.pdf",
    "Tử vi tổng hợp - Nguyễn Phát Lộc.pdf",
]

def clean_text(text: str) -> str:
    """Làm sạch text: bỏ dòng trắng thừa, ký tự rác."""
    # Bỏ nhiều dòng trắng liên tiếp
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Bỏ khoảng trắng đầu/cuối dòng
    lines = [line.strip() for line in text.splitlines()]
    # Bỏ dòng toàn ký tự không có nghĩa (số trang, ký tự đơn...)
    lines = [l for l in lines if len(l) > 2]
    return '\n'.join(lines)

def extract_pdf(filepath: str) -> dict:
    """Extract toàn bộ text từ 1 file PDF."""
    doc = fitz.open(filepath)
    total_pages = len(doc)  # Lưu trước khi đóng
    pages_text = []
    
    for page_num in range(total_pages):
        page = doc[page_num]
        text = page.get_text("text")
        if text.strip():
            pages_text.append({
                "page": page_num + 1,
                "text": clean_text(text)
            })
    
    doc.close()
    return {
        "file": os.path.basename(filepath),
        "total_pages": total_pages,
        "pages_with_text": len(pages_text),
        "pages": pages_text
    }

def chunk_text_by_topic(text: str, min_len: int = 100) -> list[str]:
    """
    Chia text thành các chunk theo tiêu đề chương/mục.
    Tìm các dòng có vẻ là tiêu đề (IN HOA, ngắn, có số thứ tự...).
    """
    chunks = []
    # Tách theo dấu hiệu tiêu đề phổ biến
    patterns = [
        r'(?=\n[A-ZÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]{3,}\n)',  # Dòng IN HOA
        r'(?=\nChương \d)',  # Chương X
        r'(?=\nPHẦN \w)',    # PHẦN X
        r'(?=\n[IVX]+\. )',  # I. II. III.
        r'(?=\n\d+\.\d+ )', # 1.1, 2.3...
    ]
    
    # Thử split theo pattern đầu tiên match được
    for pattern in patterns:
        parts = re.split(pattern, text)
        if len(parts) > 3:  # Split được ít nhất 4 phần
            chunks = [p.strip() for p in parts if len(p.strip()) >= min_len]
            break
    
    # Nếu không split được theo tiêu đề, chia theo số ký tự
    if not chunks:
        words = text.split()
        chunk_size = 500  # ~500 từ mỗi chunk
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i+chunk_size])
            if len(chunk) >= min_len:
                chunks.append(chunk)
    
    return chunks

def main():
    print("=" * 60)
    print("KHẢO SÁT TÀI LIỆU TỬ VI")
    print("=" * 60)
    
    all_data = {}
    
    for filename in PDF_FILES:
        filepath = os.path.join(DOC_DIR, filename)
        if not os.path.exists(filepath):
            print(f"[SKIP] File không tồn tại: {filename}")
            continue
        
        print(f"\n📄 Đang xử lý: {filename}")
        data = extract_pdf(filepath)
        all_data[filename] = data
        
        print(f"   → Tổng trang: {data['total_pages']}")
        print(f"   → Trang có text: {data['pages_with_text']}")
        
        # In mẫu 3 trang đầu
        print(f"\n   === MẪU NỘI DUNG (3 trang đầu) ===")
        for p in data['pages'][:3]:
            preview = p['text'][:300].replace('\n', ' ')
            print(f"   [Trang {p['page']}] {preview}...")
            print()
    
    # Lưu raw extract để kiểm tra
    output_path = os.path.join(os.path.dirname(__file__), "raw_extract.json")
    
    # Chỉ lưu 10 trang đầu mỗi file để preview (tránh file quá lớn)
    preview_data = {}
    for k, v in all_data.items():
        preview_data[k] = {
            "file": v["file"],
            "total_pages": v["total_pages"],
            "pages_with_text": v["pages_with_text"],
            "sample_pages": v["pages"][:10]  # 10 trang đầu
        }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(preview_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Đã lưu preview vào: {output_path}")
    print("\nTổng kết:")
    total_pages = sum(v['total_pages'] for v in all_data.values())
    total_text_pages = sum(v['pages_with_text'] for v in all_data.values())
    print(f"  - Tổng số trang: {total_pages}")
    print(f"  - Trang có nội dung: {total_text_pages}")

if __name__ == "__main__":
    main()
