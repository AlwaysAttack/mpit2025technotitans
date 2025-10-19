from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import pandas as pd
from predict import create_features

app = FastAPI(title="Model API", description="API для предсказания принятия заказа")

# --- Загружаем модель ---
with open("xxx_model.pkl", "rb") as f:
    saved = pickle.load(f)
model = saved["model"]
threshold = saved["threshold"]
feature_columns = saved["features"]

# --- Описание входных данных ---
class OrderData(BaseModel):
    driver_rating: float
    platform: str
    carmodel: str
    carname: str
    driver_id: int
    user_id: int
    order_timestamp: str
    tender_timestamp: str
    driver_reg_date: str
    distance_in_meters: float
    duration_in_seconds: float
    pickup_in_meters: float
    pickup_in_seconds: float
    price_start_local: float
    price_bid_local: float

@app.post("/predict")
def predict(data: OrderData):
    # Преобразуем вход в DataFrame
    df = pd.DataFrame([data.dict()])

    # Генерируем признаки
    df_processed = create_features(df)

    # Гарантируем наличие всех нужных фич
    for col in feature_columns:
        if col not in df_processed.columns:
            df_processed[col] = 0
    df_processed = df_processed[feature_columns].fillna(0)

    # Предсказание
    y_proba = model.predict_proba(df_processed)[:, 1]
    y_pred = (y_proba >= threshold).astype(int)

    return {
        "probability": float(y_proba[0]),
        "prediction": int(y_pred[0])
    }

# Пример запуска: uvicorn fast_api_model:app --reload
