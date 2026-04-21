import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('knowledge/knowledge_base.json', encoding='utf-8') as f:
    kb = json.load(f)

# Tìm chunk có chứa nội dung về "SAO TỬ VI" thực sự
print("=== TÌM CHUNK CÓ NỘI DUNG SAO TỬ VI ===\n")
found = 0
for c in kb['chunks']:
    text = c['text']
    if 'tử vi' in text.lower() and len(text) > 300 and 'mục lục' not in text.lower():
        print(f"Chunk ID: {c['id']}")
        print(f"Pages: {c['page_start']} - {c['page_end']}")
        print(f"Topics: {c['topics'][:3]}")
        print(f"Text (500 ký tự đầu):\n{text[:500]}")
        print("-" * 60)
        found += 1
        if found >= 3:
            break

# Thêm: đếm tổng chunk từ trang 90+
late_chunks = [c for c in kb['chunks'] if c['source'] == 'menh_ly_thien_co' and c.get('page_start', 0) >= 90]
print(f"\n→ Tổng chunks từ trang 90 trở đi (nội dung sao): {len(late_chunks)}")
print(f"→ Tổng tất cả chunks: {len(kb['chunks'])}")
