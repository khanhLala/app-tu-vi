from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
from lib.database import get_db
from lib.models import User, TuViChart, Role
from lib.auth import get_password_hash, verify_password, create_access_token, get_current_user, RoleChecker
from lib.placer import build_full_chart


# --- APP INITIALIZATION ---
app = FastAPI(
    title="Tử Vi API Service",
    description="Microservice cung cấp tính toán lá số Tử Vi với RBAC",
    version="1.1.0"
)

# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Cho phép tất cả các nguồn trong môi trường dev
    allow_credentials=True,
    allow_methods=["*"], # Cho phép tất cả các method (GET, POST, PUT, DELETE, v.v.)
    allow_headers=["*"], # Cho phép tất cả các header
)

# --- AUTH MODELS ---
class UserCreate(BaseModel):
    username: str = Field(..., max_length=50)
    password: str = Field(..., max_length=72)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = "user"
    is_active: bool = True


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
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        is_active=user.is_active
    )
    
    # Assign Role
    if user.role:
        role_name = user.role.upper()
        db_role = db.query(Role).filter(Role.name == role_name).first()
        if db_role:
            new_user.roles = [db_role]
    
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
def generate_chart(request: TuViRequest):
    """
    Tạo lá số tử vi (Public endpoint cho Microservice gọi)
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

# --- ADMIN USER CRUD MODELS ---
class UserResponse(BaseModel):
    id: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    items: List[UserResponse]
    total: int

class UserUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = Field(None, max_length=72)
    role: Optional[str] = None
    is_active: Optional[bool] = None


# --- ENDPOINTS ---

@app.get("/api/v1/admin/users", response_model=UserListResponse)
def list_users(
    skip: int = Query(0, ge=0), 
    limit: int = Query(20, ge=1, le=100), 
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker(["admin"]))
):
    query = db.query(User)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (User.username.ilike(search_filter)) | 
            (User.first_name.ilike(search_filter)) | 
            (User.last_name.ilike(search_filter)) |
            (User.email.ilike(search_filter))
        )
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return {"items": items, "total": total}

@app.post("/api/v1/admin/users", response_model=UserResponse)
def admin_create_user(user_data: UserCreate, db: Session = Depends(get_db), admin: User = Depends(RoleChecker(["admin"]))):
    db_user = db.query(User).filter(User.username == user_data.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    try:
        hashed_pw = get_password_hash(user_data.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    new_user = User(
        username=user_data.username,
        password_hash=hashed_pw,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        phone=user_data.phone,
        is_active=user_data.is_active
    )

    # Assign Role
    if user_data.role:
        role_name = user_data.role.upper()
        db_role = db.query(Role).filter(Role.name == role_name).first()
        if db_role:
            new_user.roles = [db_role]

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/api/v1/admin/users/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: str, db: Session = Depends(get_db), admin: User = Depends(RoleChecker(["admin"]))):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/api/v1/admin/users/{user_id}", response_model=UserResponse)
def update_user(user_id: str, user_data: UserUpdate, db: Session = Depends(get_db), admin: User = Depends(RoleChecker(["admin"]))):
    db_user = db.query(User).filter(User.id == user_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_dict = user_data.dict(exclude_unset=True)
    if 'password' in update_dict:
        try:
            db_user.password_hash = get_password_hash(update_dict.pop('password'))
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    if 'role' in update_dict:
        role_name = update_dict.pop('role').upper()
        db_role = db.query(Role).filter(Role.name == role_name).first()
        if db_role:
            db_user.roles = [db_role]
    
    for key, value in update_dict.items():
        if hasattr(db_user, key):
            setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/api/v1/admin/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), admin: User = Depends(RoleChecker(["admin"]))):
    if admin.id == user_id:

        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

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
