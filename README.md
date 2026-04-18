# 🌌 Tử Vi App - Hệ thống Lập lá số & Mạng xã hội Nghiệm lý

Chào mừng bạn đến với **Tử Vi App**, một ứng dụng toàn diện được thiết kế để lập lá số Tử Vi chính xác, lưu trữ lịch sử cá nhân và kết nối cộng đồng yêu thích huyền học.

## 🏗️ Kiến trúc hệ thống

Ứng dụng được xây dựng theo mô hình 3 lớp (3-tier) hiện đại:

1.  **Backend (`tuvi-backend`)**: Spring Boot (Java 17). Quản lý người dùng, bài viết, bình luận, lượt thích, bảo mật JWT và lưu trữ lịch sử lá số vào MySQL.
2.  **Engine (`tuvi-python`)**: FastAPI (Python). Chịu trách nhiệm thực hiện các thuật toán tính toán sao Tử Vi phức tạp và tích hợp AI.
3.  **Mobile (`tuvi-mobile`)**: React Native (Expo). Giao diện người dùng trên di động, hiển thị lá số tương tác và feed cộng đồng.

---

## 🚀 Hướng dẫn cài đặt và Chạy

### 1. Dịch vụ Python (Engine)
Thực hiện tính toán lá số.
```bash
cd tuvi-python
# Cài đặt thư viện
pip install -r requirements.txt
# Chạy service (Port 8000)
python api.py
```

### 2. Backend (Spring Boot)
Quản lý dữ liệu và logic nghiệp vụ.
```bash
cd tuvi-backend
# Tạo file .env dựa trên các mẫu trong code (Database, JWT, Cloudinary)
# Chạy backend (Port 8080)
./mvnw spring-boot:run
```

### 3. Mobile (Expo)
Giao diện người dùng.
```bash
cd tuvi-mobile
# Cài đặt dependencies
npm install
# Chạy Expo Go
npx expo start
```

---

## 🔐 Cấu hình Môi trường (.env)

Hệ thống sử dụng các biến môi trường để bảo mật. Hãy đảm bảo bạn đã cấu hình file `.env` trong thư mục `tuvi-backend`:

| Biến | Mô tả |
| :--- | :--- |
| `DB_URL` | URL kết nối MySQL |
| `DB_USERNAME` | Tên đăng nhập DB |
| `DB_PASSWORD` | Mật khẩu DB |
| `JWT_SIGNER_KEY` | Chìa khóa ký Token (64+ ký tự) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Name (Lưu ảnh avatar) |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |

---

## ✨ Tính năng chính
-   ✅ Lập lá số Tử Vi chính xác theo giờ/ngày/tháng/năm sinh.
-   ✅ Lưu trữ lịch sử lá số an toàn cho từng tài khoản.
-   ✅ Chia sẻ lá số lên cộng đồng để thảo luận.
-   ✅ Tương tác (Like/Comment) trên các bài viết nghiệm lý.
-   ✅ Quản lý thông tin cá nhân và bảo mật tài khoản.

---

## 📜 Giấy phép
Dự án được phát triển cho mục đích học tập và nghiên cứu. Chúc bạn có những giây phút nghiệm lý thú vị!
