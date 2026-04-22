import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import sqlalchemy as sa

load_dotenv()

DB_USER = os.getenv("DB_USERNAME", "root")
DB_PASS = os.getenv("DB_PASSWORD", "123456")
DB_NAME = "tuvi_db"
DB_HOST = "127.0.0.1"

url = f"mysql+mysqlconnector://{DB_USER}:{DB_PASS}@{DB_HOST}:3306/{DB_NAME}"

try:
    engine = create_engine(url)
    with engine.connect() as conn:
        print("SUCCESS: Connected to DB")
        # Check users table
        res = conn.execute(sa.text("SELECT id, username FROM users"))
        users = res.fetchall()
        print(f"Found {len(users)} users:")
        for u in users:
            print(f"- ID: {u[0]}, Username: {u[1]}")
            
        # Check roles for 'khanh'
        res = conn.execute(sa.text("SELECT role_name FROM user_roles JOIN users ON users.id = user_roles.user_id WHERE users.username = 'khanh'"))
        roles = res.fetchall()
        print(f"Roles for 'khanh': {[r[0] for r in roles]}")

except Exception as e:
    print(f"FAILURE: {e}")
