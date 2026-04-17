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

if __name__ == "__main__":
    ls = TuViHamSo("Tuyết Nhi", 30, 1, 2004, 4, 10, 2, False, view_year=2026)
    ls.print_chart()