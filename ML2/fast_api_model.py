from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import pandas as pd
import numpy as np
from predict import create_features
from fastapi.middleware.cors import CORSMiddleware

# ==================== Настройка приложения ====================

app = FastAPI(title="Model API", description="API для предсказаний и расчёта оптимальной цены")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # для React Native
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Загрузка модели ====================

with open("xxx_model.pkl", "rb") as f:
    saved = pickle.load(f)
model = saved["model"]
threshold = saved["threshold"]
feature_columns = saved["features"]

# ==================== Входные данные ====================

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


# ==================== Предсказание принятия ====================

@app.post("/predict")
def predict_order(data: OrderData):
    df = pd.DataFrame([data.dict()])
    df_processed = create_features(df)

    for col in feature_columns:
        if col not in df_processed.columns:
            df_processed[col] = 0
    df_processed = df_processed[feature_columns].fillna(0)

    y_proba = model.predict_proba(df_processed)[:, 1]
    y_pred = (y_proba >= threshold).astype(int)

    return {
        "probability": float(round(y_proba[0], 3)),
        "prediction": int(y_pred[0]),
        "threshold": threshold
    }


# ==================== Поиск оптимальной цены ====================

def optimal_price(data: OrderData, max_increase: float = 1.5, prob_limit: float = 0.95):
    """
    Возвращает оптимальную цену для водителя, где ожидаемый доход (bid * probability) максимален.
    """
    base_data = data.dict()
    base_price = base_data["price_start_local"]

    bids = np.linspace(base_price, base_price * max_increase, 25)
    results = []

    for bid in bids:
        sample = base_data.copy()
        sample["price_bid_local"] = bid
        df = pd.DataFrame([sample])
        df_processed = create_features(df)

        for col in feature_columns:
            if col not in df_processed.columns:
                df_processed[col] = 0
        df_processed = df_processed[feature_columns].fillna(0)

        prob = model.predict_proba(df_processed)[0, 1]
        exp_income = bid * prob
        results.append({"bid": bid, "prob": prob, "expected_income": exp_income})

    df_res = pd.DataFrame(results)
    df_res = df_res[df_res["prob"] <= prob_limit]
    best_row = df_res.loc[df_res["expected_income"].idxmax()]

    return {
        "optimal_bid": round(float(best_row["bid"]), 2),
        "probability": round(float(best_row["prob"]), 3),
        "expected_income": round(float(best_row["expected_income"]), 2),
        "base_price": base_price
    }

# ================================================================
# Запуск: uvicorn fast_api_model:app --reload --host 0.0.0.0 --port 8000
# ================================================================
