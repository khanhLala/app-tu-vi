import math
from datetime import datetime, timedelta

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
    
    TU_VI_TABLE = {
        1: [1, 4, 11, 6, 9], 2: [2, 1, 4, 11, 6], 3: [2, 2, 1, 4, 11], 4: [3, 0, 2, 1, 4], 5: [3, 2, 0, 2, 1],
        6: [4, 3, 0, 7, 2], 7: [4, 6, 2, 0, 10], 8: [5, 3, 3, 0, 7], 9: [5, 4, 1, 2, 0], 10: [6, 7, 6, 3, 0],
        11: [6, 4, 3, 8, 2], 12: [7, 0, 4, 1, 3], 13: [7, 8, 2, 6, 11], 14: [8, 0, 7, 3, 8], 15: [8, 6, 4, 4, 1],
        16: [9, 9, 0, 9, 6], 17: [9, 6, 3, 2, 3], 18: [10, 7, 8, 7, 4], 19: [10, 10, 0, 4, 0], 20: [11, 7, 6, 0, 9],
        21: [11, 8, 4, 10, 2], 22: [0, 11, 9, 3, 7], 23: [0, 8, 6, 8, 4], 24: [1, 9, 7, 0, 0], 25: [1, 0, 0, 6, 1],
        26: [2, 9, 10, 11, 10], 27: [2, 10, 7, 4, 3], 28: [3, 1, 8, 9, 8], 29: [3, 10, 6, 6, 0], 30: [4, 11, 11, 7, 6],
    }

    def __init__(self, name, day, month, year, hour, minute, gender, is_lunar=False):
        self.name = name
        self.gender = gender
        if not is_lunar:
            self.solar_date = datetime(year, month, day, hour, minute)
            self.d, self.m, self.y, self.leap = self.calculate_lunar_date(day, month, year)
        else:
            self.d, self.m, self.y, self.leap = day, month, year, 0
            self.solar_date = None

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
        self.la_so = {i: {"stars": [], "name": self.CHI[i], "palace": ""} for i in range(12)}
        self.build_chart()

    def calculate_ban_menh(self):
        # Using a list of 30 names covering the 60 combinations
        # Each name applies to 2 consecutive years (e.g. Giap Ty and At Suu)
        # We index by (Can // 2) and (Chi // 2) or use a map
        names = {
            (0, 0): "Hải Trung Kim", (1, 1): "Lư Trung Hỏa", (2, 2): "Đại Lâm Mộc",
            (3, 3): "Lộ Bàng Thổ", (4, 4): "Kiếm Phong Kim", (5, 5): "Sơn Đầu Hỏa",
            (0, 0): "Hải Trung Kim", # Adjusted Below
        }
        # More robust: use the standard 60-year sequence
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

    # Internal Astronomical Helpers (GMT+7)
    @staticmethod
    def _get_new_moon_day(k):
        import math
        t = k / 1236.85
        t2, t3, t4 = t*t, t*t*t, t*t*t*t
        jde = 2415020.75933 + 29.53058868 * k + 0.0001178 * t2 - 0.000000155 * t3 + \
              0.00033 * math.sin((166.56 + 132.87 * t - 0.009173 * t2) * math.pi / 180)
        m = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3
        m_prime = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3
        f = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3
        c = (0.1734 - 0.000393 * t) * math.sin(m * math.pi / 180) + \
            0.0021 * math.sin(2 * m * math.pi / 180) - \
            0.4068 * math.sin(m_prime * math.pi / 180) + \
            0.0161 * math.sin(2 * m_prime * math.pi / 180) - \
            0.0004 * math.sin(3 * m_prime * math.pi / 180) + \
            0.0104 * math.sin(2 * f * math.pi / 180) - \
            0.0051 * math.sin((m + m_prime) * math.pi / 180) - \
            0.0074 * math.sin((m - m_prime) * math.pi / 180) + \
            0.0004 * math.sin((2 * f + m) * math.pi / 180) - \
            0.0004 * math.sin((2 * f - m) * math.pi / 180) - \
            0.0006 * math.sin((2 * f + m_prime) * math.pi / 180) + \
            0.0010 * math.sin((2 * f - m_prime) * math.pi / 180) + \
            0.0005 * math.sin((m + 2 * m_prime) * math.pi / 180)
        dt = 0.001 + 0.000839*t + 0.0002261*t2 if t < -11 else -0.000278 + 0.000265*t + 0.000262*t2
        return int(jde + c - dt + 0.5 + 7/24)

    @staticmethod
    def _get_sun_longitude(jdn):
        import math
        t = (jdn - 0.5 - 7/24 - 2451545) / 36525
        t2, t3 = t*t, t*t*t
        m = 357.52910 + 35999.05030 * t - 0.0001559 * t2 - 0.00000048 * t3
        l0 = 280.46645 + 36000.76983 * t + 0.0003032 * t2
        c = (1.914600 - 0.004817 * t - 0.000014 * t2) * math.sin(m * math.pi / 180) + \
            (0.019993 - 0.000101 * t) * math.sin(2 * m * math.pi / 180) + \
            0.000290 * math.sin(3 * m * math.pi / 180)
        l = l0 + c
        return int(12 * (l/180 - 2 * int(l/360)))

    @staticmethod
    def _get_lunar_month11(y):
        off = get_jdn(31, 12, y) - 2415021
        k = int(off / 29.530588853)
        nm = TuViHamSo._get_new_moon_day(k)
        if TuViHamSo._get_sun_longitude(nm) >= 9:
            nm = TuViHamSo._get_new_moon_day(k - 1)
        return nm

    @staticmethod
    def _get_leap_month_offset(a11):
        k = int((a11 - 2415021.07699) / 29.530588853 + 0.5)
        last = 0
        for i in range(1, 14):
            arc = TuViHamSo._get_sun_longitude(TuViHamSo._get_new_moon_day(k + i))
            if arc == last: return i
            last = arc
        return 0

    def calculate_lunar_date(self, d, m, y):
        jdn = get_jdn(d, m, y)
        k = int((jdn - 2415021.07699) / 29.530588853)
        month_start = self._get_new_moon_day(k + 1)
        if month_start > jdn: month_start = self._get_new_moon_day(k)
        
        a11 = self._get_lunar_month11(y)
        if a11 >= month_start:
            y_lunar_base = y
            a11 = self._get_lunar_month11(y - 1)
        else:
            y_lunar_base = y + 1
            b11 = self._get_lunar_month11(y + 1)
            
        l_day = jdn - month_start + 1
        diff = (month_start - a11) // 29
        l_leap = False
        l_month = diff + 11
        
        # Check if year is intercalary (13 months between Month 11s)
        b11 = self._get_lunar_month11(y_lunar_base if a11 < month_start else y_lunar_base + 1)
        if b11 - a11 > 365:
            leap_off = self._get_leap_month_offset(a11)
            if diff >= leap_off:
                l_month = diff + 10
                if diff == leap_off: l_leap = True
        
        if l_month > 12: l_month -= 12
        y_lunar = y_lunar_base
        if l_month >= 11 and diff < 4: y_lunar -= 1
        return l_day, l_month, y_lunar, 1 if l_leap else 0

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

    # PRIMARY_STAR_DATA maps Purple Star position (0-11) to {palace_idx: [stars_with_strength]}
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
        10: {0: ["Thất Sát (Đ)"], 2: ["Liêm Trinh (Đ)"], 4: ["Phá Quân (Đ)"], 5: ["Thiên Đồng (V)"], 6: ["Vũ Khúc (Đ)", "Thiên Phủ (Đ)"], 7: ["Thái Âm (Đ)", "Thái Dương (Đ)"], 8: ["Tham Lang (M)"], 9: ["Thiên Cơ (M)", "Cự Môn (M)"], 10: ["Tử Vi (V)", "Thiên Tướng (V)"], 11: ["Thiên Lương (V)"]},
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
                self.la_so[sign_idx]["stars"].extend(stars)

    def an_phu_tinh(self):
        for i, star in enumerate(["Thái Tuế", "Thiếu Dương", "Tang Môn", "Thiếu Âm", "Quan Phù", "Tử Phù", "Tuế Phá", "Long Đức", "Bạch Hổ", "Phúc Đức", "Điếu Khách", "Trực Phù"]):
            self.la_so[self.move(self.chi_idx, i)]["stars"].append(star)

        loc_ton_start = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0][self.can_idx]
        is_thuan = (self.is_duong_nam and self.gender == 1) or (not self.is_duong_nam and self.gender == 0)
        for i, star in enumerate(["Lộc Tồn", "Bác Sĩ", "Lực Sĩ", "Thanh Long", "Tiểu Hao", "Tướng Quân", "Tấu Thư", "Phi Liêm", "Hỷ Thần", "Bệnh Phù", "Đại Hao", "Phục Binh"]):
            pos = self.move(loc_ton_start, i, is_thuan)
            self.la_so[pos]["stars"].append(star)
            if star == "Lộc Tồn":
                self.la_so[self.move(pos, 1)]["stars"].append("Kình Dương")
                self.la_so[self.move(pos, 1, False)]["stars"].append("Đà La")

        self.la_so[self.move(4, self.m - 1)]["stars"].append("Tả Phụ")
        self.la_so[self.move(10, self.m - 1, False)]["stars"].append("Hữu Bật")
        self.la_so[self.move(10, self.hour_chi, False)]["stars"].append("Văn Xương")
        self.la_so[self.move(4, self.hour_chi)]["stars"].append("Văn Khúc")
        self.la_so[self.move(11, self.hour_chi)]["stars"].append("Địa Không")
        self.la_so[self.move(11, self.hour_chi, False)]["stars"].append("Địa Kiếp")

        kh_vi = {0: (1, 7), 1: (0, 8), 2: (11, 9), 3: (11, 9), 4: (1, 7), 5: (0, 8), 6: (1, 7), 7: (1, 7), 8: (3, 5), 9: (3, 5)}
        self.la_so[kh_vi[self.can_idx][0]]["stars"].append("Thiên Khôi")
        self.la_so[kh_vi[self.can_idx][1]]["stars"].append("Thiên Việt")

        dao_hoa = [9, 6, 3, 0][self.chi_idx % 4]
        self.la_so[dao_hoa]["stars"].append("Đào Hoa")
        hong_loan = self.move(3, self.chi_idx, False)
        self.la_so[hong_loan]["stars"].append("Hồng Loan")
        self.la_so[self.move(hong_loan, 6)]["stars"].append("Thiên Hỷ")

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
        print(f"LÁ SỐ TỬ VI: {self.name.upper()} ({self.am_duong_nam_nu})")
        if self.solar_date:
            print(f"Dương lịch: {self.solar_date.strftime('%d/%m/%Y')} - {self.solar_date.strftime('%H:%M')}")
        print(f"Âm lịch:    Ngày {self.d} tháng {self.m} năm {self.y}")
        print(f"Bát tự:     {can_name} {chi_name} - {month_can_name} {month_chi_name} - {day_can_name} {day_chi_name} - {self.CAN[self.hour_can]} {self.CHI[self.hour_chi]}")
        print(f"Bản mệnh:   {self.ban_menh}")
        print(f"Cục:        {cuc_full_name} - Mệnh tại: {self.la_so[self.menh_idx]['name']}")
        print(f"{'='*55}")
        
        # Layout formatting
        order = [5, 6, 7, 8, 4, 9, 3, 10, 2, 1, 0, 11]
        for i in order:
            c = self.la_so[i]
            stars = ", ".join(c['stars'])
            if stars:
                print(f"[{c['name']:<4}] {c['palace']:<12}: {stars}")
            else:
                print(f"[{c['name']:<4}] {c['palace']:<12}: (Trống)")

if __name__ == "__main__":
    # Test case: April 17, 2024 at 10:30 AM (Solar)
    # Output should reflect Lunar March 9, 2024
    ls = TuViHamSo("Quốc Khánh", 30, 1, 2004, 4, 10, 2, False)
    ls.print_chart()