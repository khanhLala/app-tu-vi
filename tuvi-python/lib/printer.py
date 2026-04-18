# lib/printer.py

from lib.constants import CAN, CHI

def print_chart(chart):
    can_name = CAN[chart.year_can]
    chi_name = CHI[chart.year_chi]
    day_can_name = CAN[chart.day_can]
    day_chi_name = CHI[chart.day_chi]
    month_can_name = CAN[chart.month_can]
    month_chi_name = CHI[chart.month_chi]
    
    cuc_names = {2: "Thủy nhị cục", 3: "Mộc tam cục", 4: "Kim tứ cục", 5: "Thổ ngũ cục", 6: "Hỏa lục cục"}
    cuc_full_name = cuc_names.get(chart.cuc, f"{chart.cuc} cục")
    
    print(f"{'='*55}")
    print(f"LÁ SỐ TỬ VI: {chart.name.upper()} ({chart.am_duong_nam_nu} - {chart.am_duong_ly})")
    if chart.solar_date:
        print(f"Dương lịch: {chart.solar_date.strftime('%d/%m/%Y')} - {chart.solar_date.strftime('%H:%M')}")
    print(f"Âm lịch:    Ngày {chart.d} tháng {chart.m} năm {chart.y}")
    print(f"Bát tự:     {can_name} {chi_name} - {month_can_name} {month_chi_name} - {day_can_name} {day_chi_name} - {CAN[chart.hour_can]} {CHI[chart.hour_chi]}")
    print(f"Bản mệnh:   {chart.ban_menh}")
    print(f"Cục:        {cuc_full_name} - Mệnh tại: {chart.la_so[chart.menh_idx]['name']}")
    print(f"Chủ mệnh:   {chart.sao_chu_menh}")
    print(f"Chủ thân:    {chart.sao_chu_than} - Thân tại: {chart.la_so[chart.than_idx]['name']}")
    tuoi_mu = chart.view_year - chart.y + 1
    print(f"Năm xem:    {chart.view_year} ({CAN[chart.view_year_can].capitalize()} {CHI[chart.view_year_chi].capitalize()}) - Tuổi: {tuoi_mu}")
    print(f"{'='*55}")
    
    order = [(chart.menh_idx + i) % 12 for i in range(12)]
    for i in order:
        c = chart.la_so[i]
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
