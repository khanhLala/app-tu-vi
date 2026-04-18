from lunarcalendar import Converter, Solar, Lunar

def convert_to_lunar(year, month, day):
    solar = Solar(year, month, day)
    lunar = Converter.Solar2Lunar(solar)
    return lunar.year, lunar.month, lunar.day, lunar.isleap

def convert_to_solar(year, month, day, isleap=False):
    lunar = Lunar(year, month, day, isleap)
    solar = Converter.Lunar2Solar(lunar)
    return solar.year, solar.month, solar.day