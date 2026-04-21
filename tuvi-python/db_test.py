import mysql.connector
import sys

try:
    conn = mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="root",
        database="tuvi_db"
    )
    print("SUCCESS: Connected to tuvi_db")
    conn.close()
except Exception as e:
    print(f"FAILED: {e}")
