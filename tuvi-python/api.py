from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import sys

# Đảm bảo mã hóa utf-8 trên Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from lib.models import TuViChart, User
from lib.placer import build_full_chart
from lib.database import engine, Base, get_db
from lib.auth import get_password_hash, verify_password, create_access_token, RoleChecker, get_current_user

# Khởi tạo DB
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tử Vi API Service",
    description="Microservice cung cấp tính toán lá số Tử Vi với RBAC",
    version="1.1.0"
)

# --- AUTH MODELS ---
class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "user"

class Token(BaseModel):
    access_token: str
    token_type: str

# --- TU VI MODELS ---
class TuViRequest(BaseModel):
    name: str = Field(..., example="Nguyen Van A")
    day: int = Field(..., ge=1, le=31, example=15)
    month: int = Field(..., ge=1, le=12, example=4)
    year: int = Field(..., ge=1900, le=2100, example=1995)
    hour: int = Field(..., ge=0, le=23, example=14)
    minute: int = Field(..., ge=0, le=59, example=30)
    gender: int = Field(..., description="1 cho Nam, 0 cho Nữ", example=1)
    is_lunar: bool = Field(False, description="True nếu ngày sinh nhập vào là Âm lịch")
    view_year: int = Field(None, description="Năm cần xem hạn (Mặc định là năm sinh)", example=2026)

# --- ENDPOINTS ---

@app.post("/api/v1/auth/register", response_model=UserCreate)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    new_user = User(
        username=user.username,
        password_hash=get_password_hash(user.password),
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return user

@app.post("/api/v1/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/v1/chart")
def generate_chart(request: TuViRequest, current_user: User = Depends(get_current_user)):
    """
    Tạo lá số tử vi (Yêu cầu đăng nhập)
    """
    try:
        chart = TuViChart(
            name=request.name,
            day=request.day,
            month=request.month,
            year=request.year,
            hour=request.hour,
            minute=request.minute,
            gender=request.gender,
            is_lunar=request.is_lunar,
            view_year=request.view_year
        )
        build_full_chart(chart)
        result = chart.to_dict()
        
        from tools import TuViHamSo
        helper = TuViHamSo(request.name, request.day, request.month, request.year, request.hour, request.minute, request.gender, request.is_lunar, request.view_year)
        result["ai_prompt"] = helper.gen_prompt()
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/admin/debug")
def admin_debug(current_user: User = Depends(RoleChecker(["admin"]))):
    """
    Endpoint chỉ dành cho Admin
    """
    return {
        "message": "Welcome, Admin!",
        "admin_user": current_user.username,
        "system_status": "All systems operational"
    }

@app.get("/api/v1/health")
def health_check():
    return {"status": "UP", "service": "Tu Vi FastAPI RBAC"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
