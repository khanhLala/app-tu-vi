import os
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SIGNER_KEY")
ALGORITHM = "HS512"

# Token from the user's previous log (Checkpoint 4)
# Header: HS512, Payload: sub: khanh, iss: tuvi.com, scope: ROLE_USER
token = "eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJ0dXZpLmNvbSIsInN1YiI6ImtoYW5oIiwiZXhwIjoxNzc2ODcwMzA5LCJpYXQiOjE3NzY4NjY3MDksImp0aSI6ImQxM2IxNDYxLWM5YTAtNDVmZS1hM2ExLWUwNDI5ZGFjY2ZmNCIsInNjb3BlIjoiUk9MRV9VU0VSIn0.javoZTmGwqWxSjY2o52sdF2ratR3YIWySWPuteJBQjLl6BshvNnxFlZUNg6188XB0nbavQHSTvWUI8GuU_MFDQ"

print(f"Testing with Key: {SECRET_KEY[:10]}...")

try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    print("SUCCESS: Result payload:")
    print(payload)
except JWTError as e:
    print(f"FAILURE: {e}")
except Exception as e:
    print(f"ERROR: {e}")
