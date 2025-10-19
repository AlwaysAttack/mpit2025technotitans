import os
import sys
from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd

# --- Настройка путей ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
sys.path.append(ROOT_DIR)

from src.model_service import TaxiBidModel  # импорт после настройки путей

# --- Инициализация FastAPI ---
app = FastAPI(title="Taxi ML API", version="1.0")

# --- Загрузка модели ---
MODEL_PATH = os.path.join(ROOT_DIR, "models", "model_xgb_enhanced.pkl")
model = TaxiBidModel(MODEL_PATH)  # модель загружается в init

# --- Описание входных данных ---
class OrderData(BaseModel):
    start_price: float
    distance_m: float
    duration_sec: float
    pickup_distance_m: float
    pickup_time_sec: float
    driver_rating: float
    driver_account_age_days: int
    car_brand: str
    car_model: str
    platform: str
    day_of_week: int
    time_of_day: int

# --- Предсказание ---
@app.post("/predict")
async def predict_order(data: OrderData):
    df = pd.DataFrame([data.dict()])
    proba = model.predict_proba(df)
    return {
        "accept_probability": float(proba),
        "message": "✅ Вероятность успешно рассчитана"
    }

# --- Проверка статуса API ---
@app.get("/")
async def root():
    return {"message": "🚕 Taxi ML API работает!"}