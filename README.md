# Phần mềm Lập Lá Số Tử Vi (App Tử Vi)

Được viết bằng Python, đây là một dự án ứng dụng mã nguồn mở hỗ trợ việc lập và an sao lá số Tử Vi cho một ngày giờ sinh cụ thể trực tiếp trên môi trường command-line.

## 🌟 Tính năng nổi bật

- Chuyển đổi chính xác ngày tháng Dương Lịch sang Âm Lịch (hỗ trợ nhập cả 2 loại ngày).
- Lập sơ đồ 12 cung chi tiết. Xác định Mệnh, Thân, Bản mệnh (Hoa Giáp), và Cục (Thủy Nhị, Mộc Tam...).
- An đầy đủ **14 Chính Tinh** và hệ thống **hàng trăm Phụ Tinh** theo đúng quy luật cổ học Tử Vi (Vòng Thái Tuế, Lộc Tồn, Tràng Sinh, Tuần/Triệt, Tứ hóa...).
- Tính toán tiểu hạn, đại hạn, và các **Sao Lưu** chính xác cho từng năm xem cụ thể.
- Phân tích và hiển thị trực tiếp ra màn hình Terminal bằng giao diện màu dễ nhìn, liệt kê Cát Tinh, Hung Tinh rõ ràng.
- Tổ chức source code tiêu chuẩn (Modular), mỗi module tách biệt, dễ dàng mở rộng sang làm Web Service.

## 📂 Tổ chức mã nguồn

Hệ thống được chia thành các tệp tin theo chuẩn Single Responsibility (Đơn Tích Mục Đích):

- `tools.py`: Module chạy khởi động (Entry point).
- `lib/models.py`: Chứa class cấu trúc hệ thống `TuViChart` xây dựng khung hệ thống các cung lá số ban đầu.
- `lib/placer.py`: "Khối óc" chính, chứa toàn bộ thuật toán an sao được chia nhỏ (Ví dụ: `an_sao_theo_thang`, `an_tu_hoa`, `an_thai_tue`).
- `lib/printer.py`: Trình biên dịch hiển thị (Mảng Presentation) giúp in lá số tử vi với text tô màu.
- `lib/constants.py`: Từ điển cung mệnh, Can/Chi và các mảng danh sách sao.
- `lib/utils.py` & `lib/lunar.py`: Các function hỗ trợ chuyển đổi tính ngày.

## ⚙️ Cài đặt hệ thống

Yêu cầu môi trường tối thiểu: **Python 3.x**

Kiểm tra và cài đặt nhanh các package từ tệp requirements:
```bash
pip install -r requirements.txt
```

*(Gói thư viện bắt buộc có sãn: `lunarcalendar` để hỗ trợ module chuyển đổi Âm Dương lịch)*

## 🚀 Hướng dẫn sử dụng

Chạy file `tools.py` để xem chương trình hoạt động:

```bash
python tools.py
```

Để lập lá số Tử Vi cho **ngày giờ sinh của riêng bạn**, bạn hãy vào file `tools.py`, phần `if __name__ == "__main__":` và tuỳ chỉnh đầu vào:

```python
# Mẫu điền thông tin:
from tools import TuViHamSo

ls = TuViHamSo(
    name="Tên Của Bạn", 
    day=30,          # Ngày
    month=1,         # Tháng
    year=2004,       # Năm
    hour=4,          # Giờ
    minute=10,       # Phút
    gender=1,        # Định dạng Giới Tính (1: Nam, 2: Nữ)
    is_lunar=False,  # False = đang nhập ngày Dương Lịch, True = đang nhập ngày Âm Lịch
    view_year=2026   # Năm hiện tại/khoản năm bạn đang muốn xem hạn
)
ls.print_chart()
```

## 🛠 Tích hợp Web & Mở Rộng 

Bởi vì codebase đã được cấu trúc thành các API nhỏ lẻ (`lib/models.py`, `lib/placer.py`), bạn hoàn toàn có thể nhúng trực tiếp dữ liệu vào Framework Web như **FastAPI/Flask/Django** để trả về định dạng `JSON` cho Front-end (VD: React, Vue) vẽ lá số hiển thị một cách dễ dàng, không bị lệ thuộc vào giao diện dòng lệnh.
