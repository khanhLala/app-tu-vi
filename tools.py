import math
import sys
from datetime import datetime, timedelta
from lib.lunar import convert_to_lunar, convert_to_solar

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def get_jdn(d, m, y):
    """Calculate Julian Day Number for a Gregorian date."""
    if m <= 2:
        y -= 1
        m += 12
    a = y // 100
    b = 2 - a + (a // 4)
    return int(365.25 * (y + 4716)) + int(30.6001 * (m + 1)) + d + b - 1524

class TuViHamSo:
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

    def __init__(self, name, day, month, year, hour, minute, gender, is_lunar=False, view_year=None):
        self.name = name
        self.gender = gender

        # convert sang âm lịch
        if not is_lunar:
            self.solar_date = datetime(year, month, day, hour, minute)
            self.y, self.m, self.d, isleap_val = convert_to_lunar(year, month, day)
            self.leap = 1 if isleap_val else 0
        else:
            self.d, self.m, self.y, self.leap = day, month, year, 0 # Assume non-leap for input lunar date
            s_y, s_m, s_d = convert_to_solar(self.y, self.m, self.d, bool(self.leap))
            self.solar_date = datetime(s_y, s_m, s_d, hour, minute)

        self.view_year = view_year if view_year else (self.solar_date.year if self.solar_date else year)
        self.view_year_can = (self.view_year - 4) % 10
        self.view_year_chi = (self.view_year - 4) % 12

        self.year_can, self.year_chi = self.get_year_can_chi(self.y)
        self.month_can, self.month_chi = self.get_month_can_chi(self.year_can, self.m)
        self.day_can, self.day_chi = self.get_day_can_chi(day, month, year)
        self.hour_can, self.hour_chi = self.get_hour_can_chi(self.day_can, hour, minute)

        self.can_idx = self.year_can
        self.chi_idx = self.year_chi
        
        # Xác định Âm/Dương Nam/Nữ
        is_duong_year = (self.year_can % 2 == 0)
        gender_str = "Nam" if self.gender == 1 else "Nữ"
        am_duong_str = "Dương" if is_duong_year else "Âm"
        self.am_duong_nam_nu = f"{am_duong_str} {gender_str}"
        
        self.is_duong_nam = is_duong_year # Standard for chart rotation
        self.ban_menh = self.calculate_ban_menh()
        # Sao chủ mệnh và sao chủ thân
        self.sao_chu_menh = self.SAO_CHU_MENH[self.year_chi]
        self.sao_chu_than = self.SAO_CHU_THAN[self.year_chi]
        self.la_so = {i: {"chinh_tinh": [], "cat_tinh": [], "hung_tinh": [], "tuan_triet": [], "trang_sinh": "", "dai_han": 0, "tieu_han": "", "nguyet_han": 0, "name": self.CHI[i], "palace": ""} for i in range(12)}
        self.build_chart()
        
        # Xác định Âm Dương Thuận/Nghịch lý
        is_menh_duong = (self.menh_idx % 2 == 0)
        self.am_duong_ly = "Âm Dương thuận lý" if self.is_duong_nam == is_menh_duong else "Âm Dương nghịch lý"

    # Xác định bản mệnh
    def calculate_ban_menh(self):
        hoa_giap = [
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
        idx = (self.y - 4) % 60
        return hoa_giap[idx]

    def get_year_can_chi(self, year):
        return (year - 4) % 10, (year - 4) % 12

    def get_month_can_chi(self, year_can, month):
        chi = (month + 1) % 12
        start_can = (year_can * 2 + 2) % 10
        return (start_can + month - 1) % 10, chi

    def get_day_can_chi(self, d, m, y):
        diff = get_jdn(d, m, y) - 2415021
        return (diff % 10), (diff + 10) % 12

    def get_hour_can_chi(self, day_can, hour, minute):
        idx = ((hour + 1) % 24) // 2
        return ((day_can * 2) + idx) % 10, idx

    def move(self, start, steps, clockwise=True):
        return (start + steps) % 12 if clockwise else (start - steps) % 12

    # PRIMARY_STAR_DATA giúp an chính tinh theo vị trí sao tử vi
    # idx 0-11 là từ Tý -> Hợi
    # (M): Miếu, (V): Vượng, (Đ): Đắc, (H): Hãm
    PRIMARY_STAR_DATA = {
        0: {0: ["Tử Vi (Đ)"], 2: ["Phá Quân (H)"], 4: ["Liêm Trinh (M)", "Thiên Phủ (V)"], 5: ["Thái Âm (H)"], 6: ["Tham Lang (H)"], 7: ["Thiên Đồng (H)", "Cự Môn (H)"], 8: ["Vũ Khúc (V)", "Thiên Tướng (M)"], 9: ["Thái Dương (H)", "Thiên Lương (H)"], 10: ["Thất Sát (H)"], 11: ["Thiên Cơ (H)"]},
        1: {0: ["Thiên Cơ (Đ)"], 1: ["Tử Vi (Đ)", "Phá Quân (V)"], 3: ["Thiên Phủ (V)"], 4: ["Thái Âm (H)"], 5: ["Liêm Trinh (H)", "Tham Lang (H)"], 6: ["Cự Môn (Đ)"], 7: ["Thiên Tướng (Đ)"], 8: ["Thiên Đồng (M)", "Thiên Lương (V)"], 9: ["Vũ Khúc (M)", "Thất Sát (H)"], 10: ["Thái Dương (H)"]},
        2: {0: ["Phá Quân (H)"], 1: ["Thiên Cơ (Đ)"], 2: ["Tử Vi (M)", "Thiên Phủ (M)"], 3: ["Thái Âm (H)"], 4: ["Tham Lang (V)"], 5: ["Cự Môn (H)"], 6: ["Liêm Trinh (V)", "Thiên Tướng (V)"], 7: ["Thiên Lương (Đ)"], 8: ["Thất Sát (M)"], 9: ["Thiên Đồng (H)"], 10: ["Vũ Khúc (M)"], 11: ["Thái Dương (H)"]},
        3: {0: ["Thái Dương (H)"], 1: ["Thiên Phủ (M)"], 2: ["Thiên Cơ (H)", "Thái Âm (H)"], 3: ["Tử Vi (H)", "Tham Lang (H)"], 4: ["Cự Môn (H)"], 5: ["Thiên Tướng (Đ)"], 6: ["Thiên Lương (M)"], 7: ["Liêm Trinh (Đ)", "Thất Sát (Đ)"], 10: ["Thiên Đồng (H)"], 11: ["Vũ Khúc (H)", "Phá Quân (H)"]},
        4: {0: ["Thiên Đồng (V)", "Thái Âm (V)"], 1: ["Thái Âm (Đ)", "Thái Dương (Đ)"], 2: ["Tham Lang (Đ)"], 3: ["Thiên Cơ (M)", "Cự Môn (M)"], 4: ["Tử Vi (V)", "Thiên Tướng (V)"], 5: ["Thiên Lương (H)"], 6: ["Thất Sát (M)"], 8: ["Liêm Trinh (V)"], 10: ["Phá Quân (Đ)"], 11: ["Thiên Đồng (Đ)"]},
        5: {0: ["Thiên Đồng (V)", "Thái Âm (V)"], 1: ["Vũ Khúc (M)", "Tham Lang (Đ)"], 2: ["Cự Môn (V)", "Thái Dương (V)"], 3: ["Thiên Tướng (V)"], 4: ["Thiên Cơ (M)", "Thiên Lương (M)"], 5: ["Tử Vi (M)", "Thất Sát (V)"], 9: ["Liêm Trinh (H)", "Phá Quân (H)"], 11: ["Thái Âm (M)"]},
        6: {0: ["Tham Lang (H)"], 1: ["Thiên Đồng (H)", "Cự Môn (H)"], 2: ["Vũ Khúc (V)", "Thiên Tướng (M)"], 3: ["Thái Dương (V)", "Thiên Lương (V)"], 4: ["Thất Sát (H)"], 5: ["Thiên Cơ (V)"], 6: ["Tử Vi (M)"], 8: ["Phá Quân (H)"], 10: ["Liêm Trinh (M)", "Thiên Phủ (Đ)"], 11: ["Thái Âm (M)"]},
        7: {0: ["Cự Môn (V)"], 1: ["Thiên Tướng (Đ)"], 2: ["Thiên Đồng (M)", "Thiên Lương (V)"], 3: ["Vũ Khúc (Đ)", "Thất Sát (H)"], 4: ["Thái Dương (V)"], 6: ["Thiên Cơ (Đ)"], 7: ["Tử Vi (Đ)", "Phá Quân (V)"], 9: ["Thiên Phủ (M)"], 10: ["Thái Âm (M)"], 11: ["Liêm Trinh (H)", "Tham Lang (H)"]},
        8: {0: ["Liêm Trinh (V)", "Thiên Tướng (V)"], 1: ["Thiên Lương (M)"], 2: ["Thất Sát (M)"], 3: ["Thiên Đồng (Đ)"], 4: ["Vũ Khúc (M)"], 5: ["Thái Dương (M)"], 6: ["Phá Quân (M)"], 7: ["Thiên Cơ (Đ)"], 8: ["Tử Vi (M)", "Thiên Phủ (M)"], 9: ["Thái Âm (M)"], 10: ["Tham Lang (V)"], 11: ["Cự Môn (V)"]},
        9: {0: ["Thiên Lương (V)"], 1: ["Liêm Trinh (Đ)", "Thất Sát (Đ)"], 4: ["Thiên Đồng (H)"], 5: ["Vũ Khúc (H)", "Phá Quân (H)"], 6: ["Thái Dương (M)"], 7: ["Thiên Phủ (Đ)"], 8: ["Thiên Cơ (V)", "Thái Âm (V)"], 9: ["Tử Vi (V)", "Tham Lang (V)"], 10: ["Cự Môn (H)"], 11: ["Thiên Tướng (V)"]},
        10: {0: ["Thất Sát (Đ)"], 2: ["Liêm Trinh (V)"], 4: ["Phá Quân (Đ)"], 5: ["Thiên Đồng (Đ)"], 6: ["Vũ Khúc (V)", "Thiên Phủ (M)"], 7: ["Thái Âm (V)", "Thái Dương (V)"], 8: ["Tham Lang (Đ)"], 9: ["Thiên Cơ (M)", "Cự Môn (M)"], 10: ["Tử Vi (V)", "Thiên Tướng (V)"], 11: ["Thiên Lương (H)"]},
        11: {3: ["Liêm Trinh (H)", "Phá Quân (H)"], 5: ["Thiên Phủ (Đ)"], 6: ["Thiên Đồng (H)", "Thái Âm (H)"], 7: ["Vũ Khúc (M)", "Tham Lang (M)"], 8: ["Cự Môn (Đ)", "Thái Dương (H)"], 9: ["Thiên Tướng (H)"], 10: ["Thiên Cơ (M)", "Thiên Lương (M)"], 11: ["Tử Vi (V)", "Thất Sát (M)"]}
    }

    def build_chart(self):
        self.menh_idx = self.move(self.move(2, self.m - 1), self.hour_chi, False)
        self.than_idx = self.move(self.move(2, self.m - 1), self.hour_chi, True)
        
        palaces = ["Mệnh", "Phụ mẫu", "Phúc đức", "Điền trạch", "Quan lộc", "Nô bộc", "Thiên di", "Tật ách", "Tài bạch", "Tử tức", "Phu thê", "Huynh đệ"]
        for i, name in enumerate(palaces):
            idx = self.move(self.menh_idx, i)
            self.la_so[idx]["palace"] = name
        
        if self.la_so[self.than_idx]["palace"]:
            self.la_so[self.than_idx]["palace"] += " (Thân)"
        else:
            self.la_so[self.than_idx]["palace"] = "(Thân)"
        
        cuc_table = [
            [2, 2, 6, 6, 3, 3, 5, 5, 4, 4, 6, 6],
            [6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 5, 5],
            [5, 5, 3, 3, 2, 2, 4, 4, 6, 6, 3, 3],
            [3, 3, 4, 4, 6, 6, 2, 2, 5, 5, 4, 4],
            [4, 4, 2, 2, 5, 5, 6, 6, 3, 3, 2, 2]
        ]
        self.cuc = cuc_table[self.can_idx % 5][self.menh_idx]
        
        # 3. An Chinh Tinh (Using placement rules)
        tu_vi_pos = self.TU_VI_TABLE[self.d][self.cuc - 2]
        self.an_chinh_tinh(tu_vi_pos)
            
        self.an_phu_tinh()

    def an_chinh_tinh(self, tu_vi_pos):
        if tu_vi_pos in self.PRIMARY_STAR_DATA:
            for sign_idx, stars in self.PRIMARY_STAR_DATA[tu_vi_pos].items():
                self.la_so[sign_idx]["chinh_tinh"].extend(stars)

    def an_phu_tinh(self):
        # ---- Vòng Thái Tuế (theo năm chi) ----
        THAI_TUE_LIST = [
            ("Thái Tuế",  "hung"), ("Thiếu Dương", "cat"),  ("Tang Môn",    "hung"),
            ("Thiếu Âm",   "cat"),  ("Quan Phủ",    "hung"),  ("Tử Phù",    "hung"),
            ("Tuế Phá",    "hung"), ("Long Đức",    "cat"),   ("Bạch Hổ",   "hung"),
            ("Phúc Đức",   "cat"),  ("Điếu Khách",  "hung"),  ("Trực Phù",   "hung"),
        ]
        for i, (star, kind) in enumerate(THAI_TUE_LIST):
            pos = self.move(self.chi_idx, i)
            self.la_so[pos]["cat_tinh" if kind == "cat" else "hung_tinh"].append(star)

        # ---- Vòng Lộc Tồn và Bác Sĩ (theo năm can) ----
        loc_ton_start = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0][self.can_idx]
        is_thuan = (self.is_duong_nam and self.gender == 1) or (not self.is_duong_nam and self.gender == 0)
        
        # An riêng Lộc Tồn, Kình Dương, Đà La
        self.la_so[loc_ton_start]["cat_tinh"].append("Lộc Tồn")
        self.la_so[self.move(loc_ton_start, 1)]["hung_tinh"].append("Kình Dương")
        self.la_so[self.move(loc_ton_start, 1, False)]["hung_tinh"].append("Đà La")

        # Vòng Bác Sĩ đồng cung Lộc Tồn
        BAC_SI_LIST = [
            ("Bác Sĩ",     "cat"),  ("Lực Sĩ",   "cat"),  ("Thanh Long", "cat"),
            ("Tiểu Hao",   "hung"), ("Tướng Quân", "hung"),("Tấu Thư",   "cat"),
            ("Phi Liêm",   "hung"), ("Hỷ Thần",  "cat"),  ("Bệnh Phù",  "hung"),
            ("Đại Hao",    "hung"), ("Phục Binh",  "hung"), ("Quan Phủ",  "hung"),
        ]
        for i, (star, kind) in enumerate(BAC_SI_LIST):
            pos = self.move(loc_ton_start, i, is_thuan)
            self.la_so[pos]["cat_tinh" if kind == "cat" else "hung_tinh"].append(star)

        # ---- Theo tháng sinh ----
        self.la_so[self.move(4,  self.m - 1)]["cat_tinh"].append("Tả Phụ")       # thuận từ Thìn
        self.la_so[self.move(10, self.m - 1, False)]["cat_tinh"].append("Hữu Bật")  # nghịch từ Tuất
        self.la_so[self.move(8,  self.m - 1)]["cat_tinh"].append("Thiên Giải")    # thuận từ Thân
        self.la_so[self.move(7,  self.m - 1)]["cat_tinh"].append("Địa Giải")      # thuận từ Mùi
        self.la_so[self.move(1,  self.m - 1)]["cat_tinh"].append("Thiên Y")       # thuận từ Sửu
        self.la_so[self.move(1,  self.m - 1)]["hung_tinh"].append("Thiên Riêu")   # thuận từ Sửu (cùng cung Thiên Y)
        self.la_so[self.move(9,  self.m - 1)]["hung_tinh"].append("Thiên Hình")   # thuận từ Dậu

        # ---- Theo giờ sinh ----
        # Cát: Văn Xương (nghịch từ Tuất), Văn Khúc (thuận từ Thìn)
        self.la_so[self.move(10, self.hour_chi, False)]["cat_tinh"].append("Văn Xương")
        vk_pos = self.move(4,  self.hour_chi)
        self.la_so[vk_pos]["cat_tinh"].append("Văn Khúc")
        # Thai Phụ (+2 từ Văn Khúc), Phong Cáo (-2 từ Văn Khúc)
        self.la_so[self.move(vk_pos, 2)]["cat_tinh"].append("Thai Phụ")
        self.la_so[self.move(vk_pos, 2, False)]["cat_tinh"].append("Phong Cáo")
        # Hung: Địa Không (nghịch từ Hợi), Địa Kiếp (thuận từ Hợi)
        self.la_so[self.move(11, self.hour_chi, False)]["hung_tinh"].append("Địa Không")
        self.la_so[self.move(11, self.hour_chi)]["hung_tinh"].append("Địa Kiếp")
        # Hỏa Tinh (theo chi năm sinh, giờ sinh và âm/dương nam/nữ)
        # Bắt đầu giờ Tý tại: Thân/Tý/Thìn->Dần(2), Tỵ/Dậu/Sửu->Mão(3), Dần/Ngọ/Tuất->Sửu(1), Hợi/Mão/Mùi->Dậu(9)
        hoa_tinh_start = [2, 3, 1, 9][self.chi_idx % 4]
        self.la_so[self.move(hoa_tinh_start, self.hour_chi, is_thuan)]["hung_tinh"].append("Hỏa Tinh")
        # Linh Tinh (theo chi năm sinh, giờ sinh và âm/dương nam/nữ)
        # Dần/Ngọ/Tuất khởi Tý tại Mão(3), các tuổi khác khởi tại Tuất(10). Chiều thuận nghịch NGƯỢC với Hỏa Tinh.
        linh_tinh_start = 3 if self.chi_idx in [2, 6, 10] else 10
        self.la_so[self.move(linh_tinh_start, self.hour_chi, not is_thuan)]["hung_tinh"].append("Linh Tinh")

        # ---- Theo năm can: Thiên Khôi, Thiên Việt  ----
        kh_vi = {0:(1,7), 1:(0,8), 2:(11,9), 3:(11,9), 4:(1,7), 5:(0,8), 6:(6,2), 7:(6,2), 8:(3,5), 9:(3,5)}
        self.la_so[kh_vi[self.can_idx][0]]["cat_tinh"].append("Thiên Khôi")
        self.la_so[kh_vi[self.can_idx][1]]["cat_tinh"].append("Thiên Việt")

        # ---- Theo năm can: vị trí cố định (17 sao) ----
        can = self.can_idx
        QUOC_AN    = [10,11, 1, 2, 1, 2, 4, 5, 7, 8]
        DUONG_PHU  = [ 7, 8,10,11,10,11, 1, 2, 4, 5]
        VAN_TINH   = [ 5, 6, 8, 9, 8, 9,11, 0, 9, 3]
        THIEN_QUAN = [ 7, 4, 5, 2, 3, 9,11, 9,10, 6]
        THIEN_PHUC = [ 9, 8, 0,11, 3, 2, 6, 5, 6, 5]
        LUU_HA     = [ 9,10, 7, 8, 0, 6, 3, 4,11, 2]
        THIEN_TRU  = [ 5, 6, 0, 5, 6, 8, 2, 6, 9,11]
        self.la_so[QUOC_AN   [can]]["cat_tinh" ].append("Quốc Ấn")
        self.la_so[DUONG_PHU [can]]["cat_tinh" ].append("Đường Phù")
        self.la_so[VAN_TINH  [can]]["cat_tinh" ].append("Văn Tinh")
        self.la_so[THIEN_QUAN[can]]["cat_tinh" ].append("Thiên Quan")
        self.la_so[THIEN_PHUC[can]]["cat_tinh" ].append("Thiên Phúc")
        self.la_so[LUU_HA    [can]]["hung_tinh"].append("Lưu Hà")
        self.la_so[THIEN_TRU [can]]["cat_tinh" ].append("Thiên Trù")

        # ---- Tứ hóa theo can năm (dựa theo vị trí chính tinh hoặc phụ tinh) ----
        HOA_LOC   = ["Liêm Trinh","Thiên Cơ","Thiên Đồng","Thái Âm",
                     "Tham Lang", "Vũ Khúc", "Thái Dương","Cự Môn","Thiên Lương","Phá Quân"]
        HOA_QUYEN = ["Phá Quân", "Thiên Lương","Thiên Cơ","Thiên Đồng",
                     "Thái Âm","Tham Lang","Vũ Khúc","Thái Dương","Tử Vi","Cự Môn"]
        HOA_KHOA  = ["Vũ Khúc","Tử Vi","Văn Xương","Thiên Cơ",
                     "Hữu Bật","Thiên Lương","Thái Âm","Văn Khúc","Thiên Phủ","Thái Âm"]
        HOA_KY    = ["Thái Dương","Thái Âm","Liêm Trinh","Cự Môn",
                     "Thiên Cơ","Văn Khúc","Thiên Đồng","Văn Xương","Vũ Khúc","Tham Lang"]
        for sao, ten_hoa, loai in [
            (HOA_LOC[can],   "Hóa Lộc",   "cat"),
            (HOA_QUYEN[can], "Hóa Quyền", "cat"),
            (HOA_KHOA[can],  "Hóa Khoa",  "cat"),
            (HOA_KY[can],    "Hóa Kỵ",    "hung"),
        ]:
            pos = self._find_star_palace(sao)
            if pos != -1:
                self.la_so[pos]["cat_tinh" if loai == "cat" else "hung_tinh"].append(ten_hoa)

        # ---- Tuần - Triệt (tách rời chính phụ tinh) ----
        # Triệt: theo Can năm sinh
        TRIET = {0:(8,9),1:(6,7),2:(4,5),3:(2,3),4:(0,1),5:(8,9),6:(6,7),7:(4,5),8:(2,3),9:(0,1)}
        for idx in TRIET[can]:
            self.la_so[idx]["tuan_triet"].append("Triệt")
            
        # Tuần: theo khoảng cách giữa Can và Chi năm sinh
        tuan1 = (self.chi_idx - self.can_idx - 2) % 12
        tuan2 = (self.chi_idx - self.can_idx - 1) % 12
        self.la_so[tuan1]["tuan_triet"].append("Tuần")
        self.la_so[tuan2]["tuan_triet"].append("Tuần")

        # ---- Theo năm chi (17 sao) ----
        chi = self.chi_idx

        # Nhóm cát tinh
        self.la_so[[2,11, 8, 5][chi % 4]]["cat_tinh"].append("Thiên Mã")
        self.la_so[[4, 1,10, 7][chi % 4]]["cat_tinh"].append("Hoa Cái")
        self.la_so[self.move(9, chi)       ]["cat_tinh"].append("Thiên Đức")
        self.la_so[self.move(5, chi)       ]["cat_tinh"].append("Nguyệt Đức")
        self.la_so[self.move(4, chi)       ]["cat_tinh"].append("Long Trì")
        self.la_so[self.move(10, chi, False)]["cat_tinh"].append("Phượng Các")
        self.la_so[self.move(10, chi, False)]["cat_tinh"].append("Giải Thần")

        # Nhóm hung tinh
        self.la_so[[5, 2,11, 8][chi % 4]]["hung_tinh"].append("Kiếp Sát")
        self.la_so[[5, 1, 9  ][chi % 3]]["hung_tinh"].append("Phá Toái")
        COT_THAN = [2,2,5,5,5,8,8,8,11,11,11,2]
        QUA_TU   = [10,10,1,1,1,4,4,4,7,7,7,10]
        self.la_so[COT_THAN[chi]]["hung_tinh"].append("Cô Thần")
        self.la_so[QUA_TU  [chi]]["hung_tinh"].append("Quả Tú")
        self.la_so[self.move(1, chi)       ]["hung_tinh"].append("Thiên Không")
        self.la_so[self.move(6, chi, False)]["hung_tinh"].append("Thiên Khốc")
        self.la_so[self.move(6, chi)       ]["hung_tinh"].append("Thiên Hư")

        # Đào Hoa, Hồng Loan, Thiên Hỷ (đã có công thức riêng)
        dao_hoa = [9, 6, 3, 0][chi % 4]
        self.la_so[dao_hoa]["cat_tinh"].append("Đào Hoa")
        hong_loan = self.move(3, chi, False)
        self.la_so[hong_loan]["cat_tinh"].append("Hồng Loan")
        self.la_so[self.move(hong_loan, 6)]["cat_tinh"].append("Thiên Hỷ")

        # ---- Các sao an theo lối riêng biệt (11 sao) ----
        # 1-2. Ân Quang, Thiên Quý
        van_xuong_pos = self.move(10, self.hour_chi, False)
        self.la_so[self.move(van_xuong_pos, self.d - 2)]["cat_tinh"].append("Ân Quang")
        van_khuc_pos = self.move(4, self.hour_chi)
        self.la_so[self.move(van_khuc_pos, self.d - 2, False)]["cat_tinh"].append("Thiên Quý")
        
        # 3-4. Tam Thai, Bát Tọa
        ta_phu_pos = self.move(4, self.m - 1)
        self.la_so[self.move(ta_phu_pos, self.d - 1)]["cat_tinh"].append("Tam Thai")
        huu_bat_pos = self.move(10, self.m - 1, False)
        # Sửa "tháng sinh" lỗi typo rập khuôn của sách thành "ngày sinh" (d - 1)
        self.la_so[self.move(huu_bat_pos, self.d - 1, False)]["cat_tinh"].append("Bát Tọa")

        # 5. Đẩu Quân (H)
        dau_quan_pos = self.move(self.move(self.chi_idx, self.m - 1, False), self.hour_chi)
        self.la_so[dau_quan_pos]["hung_tinh"].append("Đẩu Quân")

        # 6-7. Thiên Tài, Thiên Thọ
        self.la_so[self.move(self.menh_idx, self.chi_idx)]["cat_tinh"].append("Thiên Tài")
        self.la_so[self.move(self.than_idx, self.chi_idx)]["cat_tinh"].append("Thiên Thọ")

        # 8-9. Thiên Thương (Nô Bộc), Thiên Sứ (Tật Ách)
        self.la_so[self.move(self.menh_idx, 7, False)]["hung_tinh"].append("Thiên Thương")
        self.la_so[self.move(self.menh_idx, 5, False)]["cat_tinh"].append("Thiên Sứ")
        
        # 10-11. Thiên La (Thìn), Địa Võng (Tuất)
        self.la_so[4]["hung_tinh"].append("Thiên La")
        self.la_so[10]["hung_tinh"].append("Địa Võng")

        # ---- Vòng Tràng Sinh (tách biệt) ----
        trang_sinh_starts = {2: 8, 3: 11, 4: 5, 5: 8, 6: 2} # Thân, Hợi, Tỵ, Thân, Dần
        ts_start = trang_sinh_starts[self.cuc]
        
        TRANG_SINH_LIST = [
            "Tràng Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy",
            "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"
        ]
        for i, star in enumerate(TRANG_SINH_LIST):
            pos = self.move(ts_start, i, is_thuan)
            self.la_so[pos]["trang_sinh"] = star

        # ---- Đại Hạn (tách biệt) ----
        for i in range(12):
            pos = self.move(self.menh_idx, i, is_thuan)
            self.la_so[pos]["dai_han"] = self.cuc + i * 10
            
        # ---- Tiểu Hạn (tách biệt) ----
        # Tuổi Thân/Tý/Thìn -> Tuất (10)
        # Tuổi Hợi/Mão/Mùi -> Sửu (1)
        # Tuổi Dần/Ngọ/Tuất -> Thìn (4)
        # Tuổi Tỵ/Dậu/Sửu -> Mùi (7)
        if self.chi_idx in [8, 0, 4]:
            th_start = 10
        elif self.chi_idx in [11, 3, 7]:
            th_start = 1
        elif self.chi_idx in [2, 6, 10]:
            th_start = 4
        else:
            th_start = 7

        th_step = 1 if self.gender == 1 else -1

        for i in range(12):
            palace_idx = (th_start + i * th_step) % 12
            year_idx = (self.chi_idx + i) % 12
            self.la_so[palace_idx]["tieu_han"] = self.CHI[year_idx]

        # ---- Nguyệt Hạn (theo năm xem) ----
        chi_view_year = self.CHI[self.view_year_chi]
        cung_tieu_han = next((i for i in range(12) if self.la_so[i]["tieu_han"] == chi_view_year), -1)
        
        if cung_tieu_han != -1:
            pos1 = self.move(cung_tieu_han, self.m - 1, False)
            thang_1_pos = self.move(pos1, self.hour_chi, True)
            for k in range(12):
                pos = self.move(thang_1_pos, k, True)
                self.la_so[pos]["nguyet_han"] = k + 1

        # ---- Các sao Lưu (năm xem) ----
        # 1. L.Thái Tuế (H)
        self.la_so[self.view_year_chi]["hung_tinh"].append("L.Thái Tuế")
        
        # 2-3. L.Tang Môn, L.Bạch Hổ (H): L.Tang Môn cách L.Thái Tuế 2 cung thuận. Bạch Hổ xung chiếu.
        l_tang_mon = self.move(self.view_year_chi, 2)
        self.la_so[l_tang_mon]["hung_tinh"].append("L.Tang Môn")
        self.la_so[self.move(l_tang_mon, 6)]["hung_tinh"].append("L.Bạch Hổ")
        
        # 4-5. L.Thiên Khốc, L.Thiên Hư (H): Từ Ngọ (6), Khốc đếm nghịch, Hư đếm thuận đến năm xem
        self.la_so[self.move(6, self.view_year_chi, False)]["hung_tinh"].append("L.Thiên Khốc")
        self.la_so[self.move(6, self.view_year_chi, True)]["hung_tinh"].append("L.Thiên Hư")
        
        # 6. L.Lộc Tồn (C): Theo Can năm xem
        LOC_TON_TABLE = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0]
        l_loc_ton = LOC_TON_TABLE[self.view_year_can]
        self.la_so[l_loc_ton]["cat_tinh"].append("L.Lộc Tồn")
        
        # 7-8. L.Kình Dương, L.Đà La (H): Kình Dương trước (+1), Đà La sau (-1) Lộc Tồn
        self.la_so[self.move(l_loc_ton, 1)]["hung_tinh"].append("L.Kình Dương")
        self.la_so[self.move(l_loc_ton, 1, False)]["hung_tinh"].append("L.Đà La")
        
        # 9. L.Thiên Mã (C): Theo Chi năm xem
        l_thien_ma = [2, 11, 8, 5][self.view_year_chi % 4]
        self.la_so[l_thien_ma]["cat_tinh"].append("L.Thiên Mã")

    def _find_star_palace(self, star_name):
        """Tìm cung chứa sao theo tên (chính tinh hoặc phụ tinh)"""
        for i, c in self.la_so.items():
            if any(s.startswith(star_name) for s in c['chinh_tinh']):
                return i
            if any(s == star_name for s in c['cat_tinh'] + c['hung_tinh']):
                return i
        return -1

    def print_chart(self):
        can_name = self.CAN[self.year_can]
        chi_name = self.CHI[self.year_chi]
        day_can_name = self.CAN[self.day_can]
        day_chi_name = self.CHI[self.day_chi]
        month_can_name = self.CAN[self.month_can]
        month_chi_name = self.CHI[self.month_chi]
        
        cuc_names = {2: "Thủy nhị cục", 3: "Mộc tam cục", 4: "Kim tứ cục", 5: "Thổ ngũ cục", 6: "Hỏa lục cục"}
        cuc_full_name = cuc_names.get(self.cuc, f"{self.cuc} cục")
        
        print(f"{'='*55}")
        print(f"LÁ SỐ TỬ VI: {self.name.upper()} ({self.am_duong_nam_nu} - {self.am_duong_ly})")
        if self.solar_date:
            print(f"Dương lịch: {self.solar_date.strftime('%d/%m/%Y')} - {self.solar_date.strftime('%H:%M')}")
        print(f"Âm lịch:    Ngày {self.d} tháng {self.m} năm {self.y}")
        print(f"Bát tự:     {can_name} {chi_name} - {month_can_name} {month_chi_name} - {day_can_name} {day_chi_name} - {self.CAN[self.hour_can]} {self.CHI[self.hour_chi]}")
        print(f"Bản mệnh:   {self.ban_menh}")
        print(f"Cục:        {cuc_full_name} - Mệnh tại: {self.la_so[self.menh_idx]['name']}")
        print(f"Chủ mệnh:   {self.sao_chu_menh}")
        print(f"Chủ thân:    {self.sao_chu_than} - Thân tại: {self.la_so[self.than_idx]['name']}")
        tuoi_mu = self.view_year - self.y + 1
        print(f"Năm xem:    {self.view_year} ({self.CAN[self.view_year_can].capitalize()} {self.CHI[self.view_year_chi].capitalize()}) - Tuổi: {tuoi_mu}")
        print(f"{'='*55}")
        
        # Hiển thị các cung bắt đầu từ Mệnh, đi theo thứ tự chuẩn: Mệnh, Phụ mẫu, Phúc đức...
        order = [(self.menh_idx + i) % 12 for i in range(12)]
        for i in order:
            c = self.la_so[i]
            parts = []
            if c['chinh_tinh']:
                parts.append("CT: "  + ", ".join(c['chinh_tinh']))
            if c['cat_tinh']:
                parts.append("★ "   + ", ".join(c['cat_tinh']))
            if c['hung_tinh']:
                parts.append("✶ "   + ", ".join(c['hung_tinh']))
            content = " | ".join(parts) if parts else "(Trống)"
            ts_str = f" \033[95m[{c['trang_sinh']}]\033[0m" if c['trang_sinh'] else ""
            tt_str = f" \033[91m[{' - '.join(c['tuan_triet'])}]\033[0m" if c['tuan_triet'] else ""
            th_str = f" \033[93m(TH: {c['tieu_han']})\033[0m"
            nh_str = f" \033[92m[Tháng {c['nguyet_han']}]\033[0m" if c['nguyet_han'] else ""
            dh_str = f" \033[96m(ĐH: {c['dai_han']})\033[0m"
            print(f"[{c['name']:<4}] {c['palace']:<14}: {content}{ts_str}{tt_str}{th_str}{nh_str}{dh_str}")

if __name__ == "__main__":
    ls = TuViHamSo("Tuyết Nhi", 30, 1, 2004, 4, 10, 2, False, view_year=2026)
    ls.print_chart()