import hmac
import hashlib

key = "NamPhung99895TOEICSecretKey2026_StayFocused".encode()
print(f"Key length: {len(key)} bytes")

# HS512 usually requires 64 bytes (512 bits)
if len(key) < 64:
    print("Warning: Key is shorter than 64 bytes (512 bits)")
