# lib/models.py

from datetime import datetime
from lib.lunar import convert_to_lunar, convert_to_solar
from lib.constants import CHI, HOA_GIAP, SAO_CHU_MENH, SAO_CHU_THAN
from lib.utils import get_jdn, move

class TuViChart:
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
        self.day_can, self.day_chi = self.get_day_can_chi(self.d, self.m, self.y)
        self.hour_can, self.hour_chi = self.get_hour_can_chi(self.day_can, hour, minute)

        self.can_idx = self.year_can
        self.chi_idx = self.year_chi
        
        # Xác định Âm/Dương Nam/Nữ
        self.is_duong_year = (self.year_can % 2 == 0)
        gender_str = "Nam" if self.gender == 1 else "Nữ"
        am_duong_str = "Dương" if self.is_duong_year else "Âm"
        self.am_duong_nam_nu = f"{am_duong_str} {gender_str}"
        
        self.is_duong_nam = self.is_duong_year # Standard for chart rotation
        self.ban_menh = self.calculate_ban_menh()
        
        # Sao chủ mệnh và sao chủ thân
        self.sao_chu_menh = SAO_CHU_MENH[self.year_chi]
        self.sao_chu_than = SAO_CHU_THAN[self.year_chi]
        
        # 12 cung
        self.la_so = {
            i: {
                "chinh_tinh": [], 
                "cat_tinh": [], 
                "hung_tinh": [], 
                "tuan_triet": [], 
                "trang_sinh": "", 
                "dai_han": 0, 
                "tieu_han": "", 
                "nguyet_han": 0, 
                "name": CHI[i], 
                "palace": ""
            } for i in range(12)
        }
        
        self._setup_basic_palaces()
        
        # Xác định Âm Dương Thuận/Nghịch lý
        is_menh_duong = (self.menh_idx % 2 == 0)
        self.am_duong_ly = "Âm Dương thuận lý" if self.is_duong_nam == is_menh_duong else "Âm Dương nghịch lý"

    def calculate_ban_menh(self):
        idx = (self.y - 4) % 60
        return HOA_GIAP[idx]

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

    def _setup_basic_palaces(self):
        self.menh_idx = move(move(2, self.m - 1), self.hour_chi, False)
        self.than_idx = move(move(2, self.m - 1), self.hour_chi, True)
        
        palaces = ["Mệnh", "Phụ mẫu", "Phúc đức", "Điền trạch", "Quan lộc", "Nô bộc", "Thiên di", "Tật ách", "Tài bạch", "Tử tức", "Phu thê", "Huynh đệ"]
        for i, name in enumerate(palaces):
            idx = move(self.menh_idx, i)
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

    def find_star_palace(self, star_name):
        """Tìm cung chứa sao theo tên (chính tinh hoặc phụ tinh)"""
        for i, c in self.la_so.items():
            if any(s.startswith(star_name) for s in c['chinh_tinh']):
                return i
            if any(s == star_name for s in c['cat_tinh'] + c['hung_tinh']):
                return i
        return -1
