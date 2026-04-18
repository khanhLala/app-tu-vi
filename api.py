from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import sys

# Đảm bảo mã hóa utf-8 trên Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from lib.models import TuViChart
from lib.placer import build_full_chart

app = FastAPI(
    title="Tử Vi API Service",
    description="Microservice cung cấp tính toán lá số Tử Vi cho Spring Boot",
    version="1.0.0"
)

# Model đầu vào sử dụng Pydantic để chuẩn hóa Validation
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

@app.post("/api/v1/chart")
def generate_chart(request: TuViRequest):
    """
    Tạo lá số tử vi và trả về định dạng JSON
    """
    try:
        # Khởi tạo models
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
        
        # Build lá số (an sao)
        build_full_chart(chart)
        
        # Lấy kết quả JSON và bổ sung Prompt
        result = chart.to_dict()
        
        # Sử dụng wrapper TuViHamSo để lấy prompt (hoặc gọi trực tiếp logic)
        from tools import TuViHamSo
        # Tạo wrapper tạm thời để dùng hàm gen_prompt
        helper = TuViHamSo(request.name, request.day, request.month, request.year, request.hour, request.minute, request.gender, request.is_lunar, request.view_year)
        result["ai_prompt"] = helper.gen_prompt()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/health")
def health_check():
    return {"status": "UP", "service": "Tu Vi FastAPI"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
