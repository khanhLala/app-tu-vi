# lib/constants.py

CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"]
CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]

# Sao chủ mệnh và sao chủ thân tra theo tuổi (năm chi, 0=Tý .. 11=Hợi)
SAO_CHU_MENH = ["Tham Lang", "Cự Môn", "Lộc Tồn", "Văn Khúc", "Liêm Trinh", "Vũ Khúc",
                "Phá Quân", "Vũ Khúc", "Liêm Trinh", "Văn Khúc", "Lộc Tồn", "Cự Môn"]
SAO_CHU_THAN = ["Linh Tinh", "Thiên Tướng", "Thiên Lương", "Thiên Đồng", "Văn Xương", "Thiên Cơ",
                "Hỏa Tinh", "Thiên Tướng", "Thiên Lương", "Thiên Đồng", "Văn Xương", "Thiên Cơ"]

# Bảng an sao Tử Vi: Ngày sinh âm lịch ứng với cung an sao tử vi theo index
# của cục: (0- thuỷ nhị cục, 1-mộc tam cục, 2- kim tứ cục, 3- thổ ngũ cục, 4- hoả lục cục)
TU_VI_TABLE = {
    1: [1, 4, 11, 6, 9], 2: [2, 1, 4, 11, 6], 3: [2, 2, 1, 4, 11], 4: [3, 0, 2, 1, 4], 5: [3, 2, 0, 2, 1],
    6: [4, 3, 0, 7, 2], 7: [4, 6, 2, 0, 10], 8: [5, 3, 3, 0, 7], 9: [5, 4, 1, 2, 0], 10: [6, 7, 6, 3, 0],
    11: [6, 4, 3, 8, 2], 12: [7, 0, 4, 1, 3], 13: [7, 8, 2, 6, 11], 14: [8, 0, 7, 3, 8], 15: [8, 6, 4, 4, 1],
    16: [9, 9, 0, 9, 6], 17: [9, 6, 3, 2, 3], 18: [10, 7, 8, 7, 4], 19: [10, 10, 0, 4, 0], 20: [11, 7, 6, 0, 9],
    21: [11, 8, 4, 10, 2], 22: [0, 11, 9, 3, 7], 23: [0, 8, 6, 8, 4], 24: [1, 9, 7, 0, 0], 25: [1, 0, 0, 6, 1],
    26: [2, 9, 10, 11, 10], 27: [2, 10, 7, 4, 3], 28: [3, 1, 8, 9, 8], 29: [3, 10, 6, 6, 0], 30: [4, 11, 11, 7, 6],
}

# (M): Miếu, (V): Vượng, (Đ): Đắc, (H): Hãm
PRIMARY_STAR_DATA = {
    # tu vi cu Ty' OK
    0: {0: ["Tử Vi (B)"], 2: ["Phá Quân (H)"], 4: ["Liêm Trinh (M)", "Thiên Phủ (V)"], 5: ["Thái Âm (H)"], 6: ["Tham Lang (H)"], 7: ["Thiên Đồng (H)", "Cự Môn (H)"], 8: ["Vũ Khúc (V)", "Thiên Tướng (M)"], 9: ["Thái Dương (H)", "Thiên Lương (H)"], 10: ["Thất Sát (H)"], 11: ["Thiên Cơ (H)"]},
    # tu vi cu Suu ok
    1: {0: ["Thiên Cơ (Đ)"], 1: ["Tử Vi (Đ)", "Phá Quân (V)"], 3: ["Thiên Phủ (B)"], 4: ["Thái Âm (H)"], 5: ["Liêm Trinh (H)", "Tham Lang (H)"], 6: ["Cự Môn (V)"], 7: ["Thiên Tướng (Đ)"], 8: ["Thiên Đồng (M)", "Thiên Lương (V)"], 9: ["Vũ Khúc (Đ)", "Thất Sát (H)"], 10: ["Thái Dương (H)"]},
    # tu vi cu Dan ok
    2: {0: ["Phá Quân (M)"], 1: ["Thiên Cơ (Đ)"], 2: ["Tử Vi (M)", "Thiên Phủ (M)"], 3: ["Thái Âm (H)"], 4: ["Tham Lang (V)"], 5: ["Cự Môn (H)"], 6: ["Liêm Trinh (V)", "Thiên Tướng (V)"], 7: ["Thiên Lương (Đ)"], 8: ["Thất Sát (M)"], 9: ["Thiên Đồng (V)"], 10: ["Vũ Khúc (M)"], 11: ["Thái Dương (H)"]},
    # tu vi cu Mao OK
    3: {0: ["Thái Dương (H)"], 1: ["Thiên Phủ (B)"], 2: ["Thiên Cơ (H)", "Thái Âm (H)"], 3: ["Tử Vi (B)", "Tham Lang (H)"], 4: ["Cự Môn (H)"], 5: ["Thiên Tướng (Đ)"], 6: ["Thiên Lương (M)"], 7: ["Liêm Trinh (Đ)", "Thất Sát (Đ)"], 10: ["Thiên Đồng (H)"], 11: ["Vũ Khúc (H)", "Phá Quân (H)"]},
    # tu vi cu Thin OK
    4: {0: ["Vũ Khúc (V)", "Thiên Phủ (M)"], 1: ["Thái Âm (Đ)", "Thái Dương (Đ)"], 2: ["Tham Lang (Đ)"], 3: ["Thiên Cơ (M)", "Cự Môn (M)"], 4: ["Tử Vi (V)", "Thiên Tướng (V)"], 5: ["Thiên Lương (H)"], 6: ["Thất Sát (M)"], 8: ["Liêm Trinh (V)"], 10: ["Phá Quân (Đ)"], 11: ["Thiên Đồng (Đ)"]},
    # tu vi cu Ty. OK
    5: {0: ["Thiên Đồng (V)", "Thái Âm (V)"], 1: ["Vũ Khúc (M)", "Tham Lang (M)"], 2: ["Cự Môn (V)", "Thái Dương (V)"], 3: ["Thiên Tướng (H)"], 4: ["Thiên Cơ (M)", "Thiên Lương (M)"], 5: ["Tử Vi (M)", "Thất Sát (V)"], 9: ["Liêm Trinh (H)", "Phá Quân (H)"], 11: ["Thiên Phủ (Đ)"]},
    # tu vi cu Ngo OK
    6: {0: ["Tham Lang (H)"], 1: ["Thiên Đồng (H)", "Cự Môn (H)"], 2: ["Vũ Khúc (V)", "Thiên Tướng (M)"], 3: ["Thái Dương (V)", "Thiên Lương (V)"], 4: ["Thất Sát (H)"], 5: ["Thiên Cơ (V)"], 6: ["Tử Vi (M)"], 8: ["Phá Quân (H)"], 10: ["Liêm Trinh (M)", "Thiên Phủ (V)"], 11: ["Thái Âm (M)"]},
    # tu vi cu Mui OK
    7: {0: ["Cự Môn (V)"], 1: ["Thiên Tướng (Đ)"], 2: ["Thiên Đồng (M)", "Thiên Lương (V)"], 3: ["Vũ Khúc (Đ)", "Thất Sát (H)"], 4: ["Thái Dương (V)"], 6: ["Thiên Cơ (Đ)"], 7: ["Tử Vi (Đ)", "Phá Quân (V)"], 9: ["Thiên Phủ (B)"], 10: ["Thái Âm (M)"], 11: ["Liêm Trinh (H)", "Tham Lang (H)"]},
    # tu vi cu Than ok
    8: {0: ["Liêm Trinh (V)", "Thiên Tướng (V)"], 1: ["Thiên Lương (Đ)"], 2: ["Thất Sát (M)"], 3: ["Thiên Đồng (Đ)"], 4: ["Vũ Khúc (M)"], 5: ["Thái Dương (M)"], 6: ["Phá Quân (M)"], 7: ["Thiên Cơ (Đ)"], 8: ["Tử Vi (M)", "Thiên Phủ (M)"], 9: ["Thái Âm (M)"], 10: ["Tham Lang (V)"], 11: ["Cự Môn (Đ)"]},
    # tu vi cu Dau OK
    9: {0: ["Thiên Lương (V)"], 1: ["Liêm Trinh (Đ)", "Thất Sát (Đ)"], 4: ["Thiên Đồng (H)"], 5: ["Vũ Khúc (H)", "Phá Quân (H)"], 6: ["Thái Dương (M)"], 7: ["Thiên Phủ (Đ)"], 8: ["Thiên Cơ (V)", "Thái Âm (V)"], 9: ["Tử Vi (B)", "Tham Lang (H)"], 10: ["Cự Môn (H)"], 11: ["Thiên Tướng (Đ)"]},
    # tu vi cu Tuat OK
    10: {0: ["Thất Sát (M)"], 2: ["Liêm Trinh (V)"], 4: ["Phá Quân (Đ)"], 5: ["Thiên Đồng (Đ)"], 6: ["Vũ Khúc (V)", "Thiên Phủ (M)"], 7: ["Thái Âm (Đ)", "Thái Dương (Đ)"], 8: ["Tham Lang (Đ)"], 9: ["Thiên Cơ (M)", "Cự Môn (M)"], 10: ["Tử Vi (V)", "Thiên Tướng (V)"], 11: ["Thiên Lương (H)"]},
    # ok tu vi cu Hoi
    11: {3: ["Liêm Trinh (H)", "Phá Quân (H)"], 5: ["Thiên Phủ (Đ)"], 6: ["Thiên Đồng (H)", "Thái Âm (H)"], 7: ["Vũ Khúc (M)", "Tham Lang (M)"], 8: ["Cự Môn (Đ)", "Thái Dương (H)"], 9: ["Thiên Tướng (H)"], 10: ["Thiên Cơ (M)", "Thiên Lương (M)"], 11: ["Tử Vi (B)", "Thất Sát (V)"]}
}

HOA_GIAP = [
    "Hải Trung Kim", "Hải Trung Kim", "Lư Trung Hỏa", "Lư Trung Hỏa", "Đại Lâm Mộc", "Đại Lâm Mộc",
    "Lộ Bàng Thổ", "Lộ Bàng Thổ", "Kiếm Phong Kim", "Kiếm Phong Kim", "Sơn Đầu Hỏa", "Sơn Đầu Hỏa",
    "Giản Hạ Thủy", "Giản Hạ Thủy", "Thành Đầu Thổ", "Thành Đầu Thổ", "Bạch Lạp Kim", "Bạch Lạp Kim",
    "Dương Liễu Mộc", "Dương Liễu Mộc", "Tuyền Trung Thủy", "Tuyền Trung Thủy", "Ốc Thượng Thổ", "Ốc Thượng Thổ",
    "Tích Lịch Hỏa", "Tích Lịch Hỏa", "Tùng Bách Mộc", "Tùng Bách Mộc", "Trường Lưu Thủy", "Trường Lưu Thủy",
    "Sa Trung Kim", "Sa Trung Kim", "Sơn Hạ Hỏa", "Sơn Hạ Hỏa", "Bình Địa Mộc", "Bình Địa Mộc",
    "Bích Thượng Thổ", "Bích Thượng Thổ", "Kim Bạch Kim", "Kim Bạch Kim", "Phúc Đăng Hỏa", "Phúc Đăng Hỏa",
    "Thiên Hà Thủy", "Thiên Hà Thủy", "Đại Trạch Thổ", "Đại Trạch Thổ", "Thoa Xuyến Kim", "Thoa Xuyến Kim",
    "Tang Đố Mộc", "Tang Đố Mộc", "Đại Khê Thủy", "Đại Khê Thủy", "Sa Trung Thổ", "Sa Trung Thổ",
    "Thiên Thượng Hỏa", "Thiên Thượng Hỏa", "Thạch Lựu Mộc", "Thạch Lựu Mộc", "Đại Hải Thủy", "Đại Hải Thủy"
]

THAI_TUE_LIST = [
    ("Thái Tuế",  "hung"), ("Thiếu Dương", "cat"),  ("Tang Môn",    "hung"),
    ("Thiếu Âm",   "cat"),  ("Quan Phủ",    "hung"),  ("Tử Phù",    "hung"),
    ("Tuế Phá",    "hung"), ("Long Đức",    "cat"),   ("Bạch Hổ",   "hung"),
    ("Phúc Đức",   "cat"),  ("Điếu Khách",  "hung"),  ("Trực Phù",   "hung"),
]

BAC_SI_LIST = [
    ("Bác Sĩ",     "cat"),  ("Lực Sĩ",   "cat"),  ("Thanh Long", "cat"),
    ("Tiểu Hao",   "hung"), ("Tướng Quân", "hung"),("Tấu Thư",   "cat"),
    ("Phi Liêm",   "hung"), ("Hỷ Thần",  "cat"),  ("Bệnh Phù",  "hung"),
    ("Đại Hao",    "hung"), ("Phục Binh",  "hung"), ("Quan Phủ",  "hung"),
]

TRANG_SINH_LIST = [
    "Tràng Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy",
    "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"
]

HOA_LOC   = ["Liêm Trinh","Thiên Cơ","Thiên Đồng","Thái Âm",
             "Tham Lang", "Vũ Khúc", "Thái Dương","Cự Môn","Thiên Lương","Phá Quân"]
HOA_QUYEN = ["Phá Quân", "Thiên Lương","Thiên Cơ","Thiên Đồng",
             "Thái Âm","Tham Lang","Vũ Khúc","Thái Dương","Tử Vi","Cự Môn"]
HOA_KHOA  = ["Vũ Khúc","Tử Vi","Văn Xương","Thiên Cơ",
             "Hữu Bật","Thiên Lương","Thái Âm","Văn Khúc","Thiên Phủ","Thái Âm"]
HOA_KY    = ["Thái Dương","Thái Âm","Liêm Trinh","Cự Môn",
             "Thiên Cơ","Văn Khúc","Thiên Đồng","Văn Xương","Vũ Khúc","Tham Lang"]
