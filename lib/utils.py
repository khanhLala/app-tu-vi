# lib/utils.py

def get_jdn(d, m, y):
    """Calculate Julian Day Number for a Gregorian date."""
    if m <= 2:
        y -= 1
        m += 12
    a = y // 100
    b = 2 - a + (a // 4)
    return int(365.25 * (y + 4716)) + int(30.6001 * (m + 1)) + d + b - 1524

def move(start, steps, clockwise=True):
    """Move 'steps' from 'start' forward (clockwise) or backward (counter-clockwise) on the 12-palace ring."""
    return (start + steps) % 12 if clockwise else (start - steps) % 12
