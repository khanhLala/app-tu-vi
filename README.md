# 🌌 Tử Vi App - Hệ thống Lập lá số & Mạng xã hội Huyền học

[![Spring Boot](https://img.shields.io/badge/Spring--Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React Native](https://img.shields.io/badge/React--Native-Expo--54-blue.svg)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009485.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Tử Vi App** là một hệ sinh thái toàn diện được thiết kế để mang lại trải nghiệm lập lá số Tử Vi chính xác, kết hợp sức mạnh của AI để luận giải và một mạng xã hội thu nhỏ để cộng đồng cùng nghiệm lý.




## 🛠️ Công nghệ sử dụng

### 🔹 Mobile App (`tuvi-mobile`)
- **Framework:** React Native (Expo SDK 54)
- **Navigation:** React Navigation (Stack & Tabs)
- **State:** React Hooks & Async Storage

### 🔹 Backend Cloud (`tuvi-backend`)
- **Core:** Java 17, Spring Boot 3.2
- **An ninh:** Spring Security + JWT (JSON Web Token)
- **Dữ liệu:** Spring Data JPA (MySQL), Hibernate
- **Lưu trữ:** Cloudinary SDK for Image Upload
- **Validation:** MapStruct & Lombok

### 🔹 Astrology Engine (`tuvi-python`)
- **Framework:** FastAPI
- **Logic:** Thuật toán an sao truyền thống, chuyển đổi âm - dương lịch
- **Output:** JSON Structure quy chuẩn mô tả 12 cung và vị trí các sao

### 🔹 AI Intelligence (`tuvi-ai`)
- **Framework:** FastAPI
- **Logic:** Tích hợp LLM để luận giải lá số dựa trên
- **Knowledge Base:** Dữ liệu kiến thức huyền học được chuẩn hóa

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 🏁 1. Chuẩn bị Môi trường
- Cài đặt **Node.js** (v18+), **Java JDK** (17+), **Python** (3.12+)
- Có sẵn một instance **MySQL** 8.0+

### 🛠️ 2. Chạy Astrology Service (Python)
```bash
cd tuvi-python
pip install -r requirements.txt
python api.py # Lắng nghe tại Port 8000
```

### 🤖 3. Chạy AI Service (FastAPI)
```bash
cd tuvi-ai
pip install -r requirements.txt
python api.py # Lắng nghe tại Port 8001
```

### ☕ 4. Chạy Backend (Spring Boot)
1. Cấu hình file `tuvi-backend/.env` (tham khảo bảng bên dưới).
2. Chạy lệnh:
```bash
cd tuvi-backend
./mvnw spring-boot:run # Lắng nghe tại Port 8080
```

### 📱 5. Chạy Mobile (Expo)
```bash
cd tuvi-mobile
npm install
npx expo start -c
```

---

## 🔐 Cấu hình Môi trường (.env)

Hệ thống sử dụng **4 file `.env`** riêng biệt cho từng thành phần. Bạn cần tạo chúng tại các thư mục tương ứng:

### 1. Backend (`tuvi-backend/.env`)
Quản lý kết nối DB, bảo mật Token và lưu trữ ảnh.
| Biến | Ví dụ giá trị | Mục đích |
| :--- | :--- | :--- |
| `DB_URL` | `jdbc:mysql://localhost:3306/tuvi_db` | URL kết nối MySQL |
| `DB_USERNAME` | `root` | Tên đăng nhập Database |
| `DB_PASSWORD` | `123456` | Mật khẩu Database |
| `JWT_SIGNER_KEY` | `Mã dài 64+ ký tự` | Chìa khóa ký JWT Token |
| `CLOUDINARY_CLOUD_NAME` | `ten-cloud` | Tên Cloudinary (upload ảnh) |
| `CLOUDINARY_API_KEY` | `123456789` | API Key của Cloudinary |
| `CLOUDINARY_API_SECRET` | `secret-key` | API Secret của Cloudinary |

### 2. Mobile App (`tuvi-mobile/.env`)
Quản lý Endpoint kết nối Backend và upload ảnh trực tiếp (nếu cần).
| Biến | Ví dụ giá trị | Mục đích |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | `http://192.168.x.x:8080/api/v1` | URL API Backend (IP local) |
| `CLOUDINARY_CLOUD_NAME` | `ten-cloud` | Tên Cloudinary |
| `CLOUDINARY_API_KEY` | `123456789` | API Key Cloudinary |
| `CLOUDINARY_API_SECRET` | `secret-key` | API Secret Cloudinary |

### 3. AI Service (`tuvi-ai/.env`)
Cấu hình trí tuệ nhân tạo.
| Biến | Ví dụ giá trị | Mục đích |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` | Chìa khóa API Google Gemini |

### 4. Python Engine (`tuvi-python/.env`)
*Hiện tại service này đang dùng các giá trị mặc định, có thể để trống hoặc cấu hình thêm nếu cần mở rộng.*

---

## ✨ Tính năng nổi bật
- 📅 **Lập lá số chuyên sâu**: Chuyển đổi lịch âm dương, an sao chính xác theo giờ sinh.
- 💬 **AI Luận giải**: Trò chuyện với trợ lý AI về vận hạn, sự nghiệp, tình duyên.
- 🛒 **Cửa hàng Phong thủy**: Mua sắm vật phẩm và các gói xem lá số cao cấp.
- 👥 **Cộng đồng Nghiệm lý**: Đăng bài, chia sẻ lá số, Like/Comment thảo luận.
- 🛡️ **Quản trị viên (Admin)**: Dashboard quản lý người dùng, bài viết và doanh thu.

---

## 📜 Giấy phép
Dự án được phát triển cho mục đích học tập.
