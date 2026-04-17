# lib/placer.py

from lib.constants import (
    TU_VI_TABLE, PRIMARY_STAR_DATA, THAI_TUE_LIST, BAC_SI_LIST,
    TRANG_SINH_LIST, HOA_LOC, HOA_QUYEN, HOA_KHOA, HOA_KY, CHI
)
from lib.utils import move

def build_full_chart(chart):
    an_chinh_tinh(chart)
    an_thai_tue(chart)
    an_loc_ton_bac_si(chart)
    an_sao_thang(chart)
    an_sao_gio(chart)
    an_sao_nam_can(chart)
    an_tu_hoa(chart)
    an_tuan_triet(chart)
    an_sao_nam_chi(chart)
    an_sao_rieng_biet(chart)
    an_vong_trang_sinh(chart)
    an_han(chart)
    an_sao_luu(chart)

def an_chinh_tinh(chart):
    tu_vi_pos = TU_VI_TABLE[chart.d][chart.cuc - 2]
    if tu_vi_pos in PRIMARY_STAR_DATA:
        for sign_idx, stars in PRIMARY_STAR_DATA[tu_vi_pos].items():
            chart.la_so[sign_idx]["chinh_tinh"].extend(stars)

def an_thai_tue(chart):
    for i, (star, kind) in enumerate(THAI_TUE_LIST):
        pos = move(chart.chi_idx, i)
        chart.la_so[pos]["cat_tinh" if kind == "cat" else "hung_tinh"].append(star)

def an_loc_ton_bac_si(chart):
    loc_ton_start = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0][chart.can_idx]
    is_thuan = (chart.is_duong_nam and chart.gender == 1) or (not chart.is_duong_nam and chart.gender == 0)
    
    chart.la_so[loc_ton_start]["cat_tinh"].append("Lộc Tồn")
    chart.la_so[move(loc_ton_start, 1)]["hung_tinh"].append("Kình Dương")
    chart.la_so[move(loc_ton_start, 1, False)]["hung_tinh"].append("Đà La")

    for i, (star, kind) in enumerate(BAC_SI_LIST):
        pos = move(loc_ton_start, i, is_thuan)
        chart.la_so[pos]["cat_tinh" if kind == "cat" else "hung_tinh"].append(star)

def an_sao_thang(chart):
    chart.la_so[move(4,  chart.m - 1)]["cat_tinh"].append("Tả Phụ")
    chart.la_so[move(10, chart.m - 1, False)]["cat_tinh"].append("Hữu Bật")
    chart.la_so[move(8,  chart.m - 1)]["cat_tinh"].append("Thiên Giải")
    chart.la_so[move(7,  chart.m - 1)]["cat_tinh"].append("Địa Giải")
    chart.la_so[move(1,  chart.m - 1)]["cat_tinh"].append("Thiên Y")
    chart.la_so[move(1,  chart.m - 1)]["hung_tinh"].append("Thiên Riêu")
    chart.la_so[move(9,  chart.m - 1)]["hung_tinh"].append("Thiên Hình")

def an_sao_gio(chart):
    chart.la_so[move(10, chart.hour_chi, False)]["cat_tinh"].append("Văn Xương")
    vk_pos = move(4, chart.hour_chi)
    chart.la_so[vk_pos]["cat_tinh"].append("Văn Khúc")
    chart.la_so[move(vk_pos, 2)]["cat_tinh"].append("Thai Phụ")
    chart.la_so[move(vk_pos, 2, False)]["cat_tinh"].append("Phong Cáo")
    
    chart.la_so[move(11, chart.hour_chi, False)]["hung_tinh"].append("Địa Không")
    chart.la_so[move(11, chart.hour_chi)]["hung_tinh"].append("Địa Kiếp")
    
    is_thuan = (chart.is_duong_nam and chart.gender == 1) or (not chart.is_duong_nam and chart.gender == 0)
    hoa_tinh_start = [2, 3, 1, 9][chart.chi_idx % 4]
    chart.la_so[move(hoa_tinh_start, chart.hour_chi, is_thuan)]["hung_tinh"].append("Hỏa Tinh")
    
    linh_tinh_start = 3 if chart.chi_idx in [2, 6, 10] else 10
    chart.la_so[move(linh_tinh_start, chart.hour_chi, not is_thuan)]["hung_tinh"].append("Linh Tinh")

def an_sao_nam_can(chart):
    kh_vi = {0:(1,7), 1:(0,8), 2:(11,9), 3:(11,9), 4:(1,7), 5:(0,8), 6:(6,2), 7:(6,2), 8:(3,5), 9:(3,5)}
    chart.la_so[kh_vi[chart.can_idx][0]]["cat_tinh"].append("Thiên Khôi")
    chart.la_so[kh_vi[chart.can_idx][1]]["cat_tinh"].append("Thiên Việt")

    can = chart.can_idx
    QUOC_AN    = [10,11, 1, 2, 1, 2, 4, 5, 7, 8]
    DUONG_PHU  = [ 7, 8,10,11,10,11, 1, 2, 4, 5]
    VAN_TINH   = [ 5, 6, 8, 9, 8, 9,11, 0, 9, 3]
    THIEN_QUAN = [ 7, 4, 5, 2, 3, 9,11, 9,10, 6]
    THIEN_PHUC = [ 9, 8, 0,11, 3, 2, 6, 5, 6, 5]
    LUU_HA     = [ 9,10, 7, 8, 0, 6, 3, 4,11, 2]
    THIEN_TRU  = [ 5, 6, 0, 5, 6, 8, 2, 6, 9,11]
    
    chart.la_so[QUOC_AN[can]]["cat_tinh"].append("Quốc Ấn")
    chart.la_so[DUONG_PHU[can]]["cat_tinh"].append("Đường Phù")
    chart.la_so[VAN_TINH[can]]["cat_tinh"].append("Văn Tinh")
    chart.la_so[THIEN_QUAN[can]]["cat_tinh"].append("Thiên Quan")
    chart.la_so[THIEN_PHUC[can]]["cat_tinh"].append("Thiên Phúc")
    chart.la_so[LUU_HA[can]]["hung_tinh"].append("Lưu Hà")
    chart.la_so[THIEN_TRU[can]]["cat_tinh"].append("Thiên Trù")

def an_tu_hoa(chart):
    can = chart.can_idx
    for sao, ten_hoa, loai in [
        (HOA_LOC[can],   "Hóa Lộc",   "cat"),
        (HOA_QUYEN[can], "Hóa Quyền", "cat"),
        (HOA_KHOA[can],  "Hóa Khoa",  "cat"),
        (HOA_KY[can],    "Hóa Kỵ",    "hung"),
    ]:
        pos = chart.find_star_palace(sao)
        if pos != -1:
            chart.la_so[pos]["cat_tinh" if loai == "cat" else "hung_tinh"].append(ten_hoa)

def an_tuan_triet(chart):
    TRIET = {0:(8,9),1:(6,7),2:(4,5),3:(2,3),4:(0,1),5:(8,9),6:(6,7),7:(4,5),8:(2,3),9:(0,1)}
    for idx in TRIET[chart.can_idx]:
        chart.la_so[idx]["tuan_triet"].append("Triệt")
        
    tuan1 = (chart.chi_idx - chart.can_idx - 2) % 12
    tuan2 = (chart.chi_idx - chart.can_idx - 1) % 12
    chart.la_so[tuan1]["tuan_triet"].append("Tuần")
    chart.la_so[tuan2]["tuan_triet"].append("Tuần")

def an_sao_nam_chi(chart):
    chi = chart.chi_idx
    chart.la_so[[2,11, 8, 5][chi % 4]]["cat_tinh"].append("Thiên Mã")
    chart.la_so[[4, 1,10, 7][chi % 4]]["cat_tinh"].append("Hoa Cái")
    chart.la_so[move(9, chi)]["cat_tinh"].append("Thiên Đức")
    chart.la_so[move(5, chi)]["cat_tinh"].append("Nguyệt Đức")
    chart.la_so[move(4, chi)]["cat_tinh"].append("Long Trì")
    chart.la_so[move(10, chi, False)]["cat_tinh"].append("Phượng Các")
    chart.la_so[move(10, chi, False)]["cat_tinh"].append("Giải Thần")

    chart.la_so[[5, 2,11, 8][chi % 4]]["hung_tinh"].append("Kiếp Sát")
    chart.la_so[[5, 1, 9][chi % 3]]["hung_tinh"].append("Phá Toái")
    COT_THAN = [2,2,5,5,5,8,8,8,11,11,11,2]
    QUA_TU   = [10,10,1,1,1,4,4,4,7,7,7,10]
    chart.la_so[COT_THAN[chi]]["hung_tinh"].append("Cô Thần")
    chart.la_so[QUA_TU[chi]]["hung_tinh"].append("Quả Tú")
    chart.la_so[move(1, chi)]["hung_tinh"].append("Thiên Không")
    chart.la_so[move(6, chi, False)]["hung_tinh"].append("Thiên Khốc")
    chart.la_so[move(6, chi)]["hung_tinh"].append("Thiên Hư")

    dao_hoa = [9, 6, 3, 0][chi % 4]
    chart.la_so[dao_hoa]["cat_tinh"].append("Đào Hoa")
    hong_loan = move(3, chi, False)
    chart.la_so[hong_loan]["cat_tinh"].append("Hồng Loan")
    chart.la_so[move(hong_loan, 6)]["cat_tinh"].append("Thiên Hỷ")

def an_sao_rieng_biet(chart):
    van_xuong_pos = move(10, chart.hour_chi, False)
    chart.la_so[move(van_xuong_pos, chart.d - 2)]["cat_tinh"].append("Ân Quang")
    van_khuc_pos = move(4, chart.hour_chi)
    chart.la_so[move(van_khuc_pos, chart.d - 2, False)]["cat_tinh"].append("Thiên Quý")
    
    ta_phu_pos = move(4, chart.m - 1)
    chart.la_so[move(ta_phu_pos, chart.d - 1)]["cat_tinh"].append("Tam Thai")
    huu_bat_pos = move(10, chart.m - 1, False)
    chart.la_so[move(huu_bat_pos, chart.d - 1, False)]["cat_tinh"].append("Bát Tọa")

    dau_quan_pos = move(move(chart.chi_idx, chart.m - 1, False), chart.hour_chi)
    chart.la_so[dau_quan_pos]["hung_tinh"].append("Đẩu Quân")

    chart.la_so[move(chart.menh_idx, chart.chi_idx)]["cat_tinh"].append("Thiên Tài")
    chart.la_so[move(chart.than_idx, chart.chi_idx)]["cat_tinh"].append("Thiên Thọ")

    chart.la_so[move(chart.menh_idx, 7, False)]["hung_tinh"].append("Thiên Thương")
    chart.la_so[move(chart.menh_idx, 5, False)]["cat_tinh"].append("Thiên Sứ")
    
    chart.la_so[4]["hung_tinh"].append("Thiên La")
    chart.la_so[10]["hung_tinh"].append("Địa Võng")

def an_vong_trang_sinh(chart):
    trang_sinh_starts = {2: 8, 3: 11, 4: 5, 5: 8, 6: 2}
    ts_start = trang_sinh_starts[chart.cuc]
    is_thuan = (chart.is_duong_nam and chart.gender == 1) or (not chart.is_duong_nam and chart.gender == 0)
    
    for i, star in enumerate(TRANG_SINH_LIST):
        pos = move(ts_start, i, is_thuan)
        chart.la_so[pos]["trang_sinh"] = star

def an_han(chart):
    is_thuan = (chart.is_duong_nam and chart.gender == 1) or (not chart.is_duong_nam and chart.gender == 0)
    for i in range(12):
        pos = move(chart.menh_idx, i, is_thuan)
        chart.la_so[pos]["dai_han"] = chart.cuc + i * 10
        
    if chart.chi_idx in [8, 0, 4]:
        th_start = 10
    elif chart.chi_idx in [11, 3, 7]:
        th_start = 1
    elif chart.chi_idx in [2, 6, 10]:
        th_start = 4
    else:
        th_start = 7

    th_step = 1 if chart.gender == 1 else -1
    for i in range(12):
        palace_idx = (th_start + i * th_step) % 12
        year_idx = (chart.chi_idx + i) % 12
        chart.la_so[palace_idx]["tieu_han"] = CHI[year_idx]

    chi_view_year = CHI[chart.view_year_chi]
    cung_tieu_han = next((i for i in range(12) if chart.la_so[i]["tieu_han"] == chi_view_year), -1)
    
    if cung_tieu_han != -1:
        pos1 = move(cung_tieu_han, chart.m - 1, False)
        thang_1_pos = move(pos1, chart.hour_chi, True)
        for k in range(12):
            pos = move(thang_1_pos, k, True)
            chart.la_so[pos]["nguyet_han"] = k + 1

def an_sao_luu(chart):
    chart.la_so[chart.view_year_chi]["hung_tinh"].append("L.Thái Tuế")
    
    l_tang_mon = move(chart.view_year_chi, 2)
    chart.la_so[l_tang_mon]["hung_tinh"].append("L.Tang Môn")
    chart.la_so[move(l_tang_mon, 6)]["hung_tinh"].append("L.Bạch Hổ")
    
    chart.la_so[move(6, chart.view_year_chi, False)]["hung_tinh"].append("L.Thiên Khốc")
    chart.la_so[move(6, chart.view_year_chi, True)]["hung_tinh"].append("L.Thiên Hư")
    
    LOC_TON_TABLE = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0]
    l_loc_ton = LOC_TON_TABLE[chart.view_year_can]
    chart.la_so[l_loc_ton]["cat_tinh"].append("L.Lộc Tồn")
    
    chart.la_so[move(l_loc_ton, 1)]["hung_tinh"].append("L.Kình Dương")
    chart.la_so[move(l_loc_ton, 1, False)]["hung_tinh"].append("L.Đà La")
    
    l_thien_ma = [2, 11, 8, 5][chart.view_year_chi % 4]
    chart.la_so[l_thien_ma]["cat_tinh"].append("L.Thiên Mã")
