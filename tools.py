import sys
from lib.models import TuViChart
from lib.placer import build_full_chart
from lib.printer import print_chart

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

class TuViHamSo:
    """Wrapper class to maintain backward compatibility if needed."""
    def __init__(self, name, day, month, year, hour, minute, gender, is_lunar=False, view_year=None):
        self.chart = TuViChart(name, day, month, year, hour, minute, gender, is_lunar, view_year)
        build_full_chart(self.chart)

    def print_chart(self):
        print_chart(self.chart)

    def gen_prompt(self):
        c = self.chart
        from lib.constants import CAN, CHI
        
        cuc_names = {2: "Thủy nhị cục", 3: "Mộc tam cục", 4: "Kim tứ cục", 5: "Thổ ngũ cục", 6: "Hỏa lục cục"}
        
        # Format thông tin cá nhân
        ngay_duong = c.solar_date.strftime('%d/%m/%Y %H:%M') if c.solar_date else "Không có"
        bat_tu = f"{CAN[c.year_can]} {CHI[c.year_chi]} - {CAN[c.month_can]} {CHI[c.month_chi]} - {CAN[c.day_can]} {CHI[c.day_chi]} - {CAN[c.hour_can]} {CHI[c.hour_chi]}"
        cuc_str = cuc_names.get(c.cuc, f"{c.cuc} cục")
        
        text_info = f"--- THÔNG TIN CÁ NHÂN ---\n"
        text_info += f"- Họ tên: {c.name}\n"
        text_info += f"- Giới tính: {c.am_duong_nam_nu} ({c.am_duong_ly})\n"
        text_info += f"- Ngày sinh Dương lịch: {ngay_duong}\n"
        text_info += f"- Ngày sinh Âm lịch: Ngày {c.d} tháng {c.m} năm {c.y}\n"
        text_info += f"- Bát tự: {bat_tu}\n"
        text_info += f"- Bản mệnh: {c.ban_menh}\n"
        text_info += f"- Cục: {cuc_str}\n"
        text_info += f"- Mệnh an tại: {c.la_so[c.menh_idx]['name']} (Chủ mệnh: {c.sao_chu_menh})\n"
        text_info += f"- Thân an tại: {c.la_so[c.than_idx]['name']} (Chủ thân: {c.sao_chu_than})\n"
        text_info += f"- Năm xem hạn: {c.view_year} ({CAN[c.view_year_can]} {CHI[c.view_year_chi]})\n\n"
        
        text_info += f"--- CHI TIẾT 12 CUNG ---"
        
        for i in range(12):
            idx = (c.menh_idx + i) % 12
            p = c.la_so[idx]
            text_info += f"\n\n[{p['name']}] Cung {p['palace']}:\n"
            text_info += f"- Chính tinh: {', '.join(p['chinh_tinh']) if p['chinh_tinh'] else '(Không có)'}\n"
            text_info += f"- Cát tinh: {', '.join(p['cat_tinh']) if p['cat_tinh'] else '(Không có)'}\n"
            text_info += f"- Hung tinh: {', '.join(p['hung_tinh']) if p['hung_tinh'] else '(Không có)'}\n"
            if p['tuan_triet']:
                text_info += f"- Tuần/Triệt: {' - '.join(p['tuan_triet'])}\n"
            text_info += f"- Vòng Tràng Sinh: {p['trang_sinh']}\n"
            text_info += f"- Đại Hạn: {p['dai_han']}\n"
            text_info += f"- Tiểu Hạn: {p['tieu_han']}\n"
            if p['nguyet_han']:
                text_info += f"- Nguyệt Hạn: Tháng {p['nguyet_han']}"
        
        prompt = (
            "Đóng vai một thầy tử vi có 50 năm kinh nghiệm trong nghề và đã phân tích, nghiệm lý trên 20000 lá số, "
            "hãy phân tích lá số tử vi sau:\n"
            f"{text_info}\n\n"
            "Hãy phân tích với những khía cạnh sau: Tính cách, ngoại hình, trí tuệ, định hướng, về cha mẹ và sự hỗ trợ của cha mẹ, "
            "phúc đức của bản thân, dòng họ, sự hóa giải, nội tâm bản thân, nơi sống, nhà cửa, thừa kế đất đai, "
            "môi trường sống, về công việc, sự thăng tiến, cách làm việc, bạn bè, đồng nghiệp, cấp trên cấp dưới, "
            "khả năng đi xa, xuất ngoại, cách đối ngoại, cách người khác nhìn nhận tôi, khả năng bệnh tật, tai nạn, "
            "vận hạn trong đời, về tài chính dư dả hay không, cách kiếm tiền, giữ tiền có tốt không, "
            "về người phối ngẫu và hôn nhân, con cái, mối quan hệ với con cái, về anh chị em, thành bại của bản thân. "
            "Tôi mong muốn bạn có thể xem xét quan hệ giữa các tam hợp, nhị hợp, các bộ sao đi với nhau, "
            "các vị trí đắc, hãm, miếu, vượng của ngôi sao, cung mà sao đó an có tốt hay không, yêu cầu phải có phân tích thật chi tiết, về chính tinh và từng phụ tinh, ý nghĩa và sự phối hợp, vận hạn trong năm nay, yêu cầu phải trên 5000 chữ"
        )
        return prompt

if __name__ == "__main__":
    ls = TuViHamSo("Khánh", 17, 8, 2004, 13, 30, 1, False, view_year=2026)
    ls.print_chart()
    
    print("\n--- PROMPT ĐỂ ĐƯA CHO AI ---\n")
    print(ls.gen_prompt())