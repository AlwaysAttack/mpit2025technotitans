import pickle
import pandas as pd
from predict import create_features

class ModelAPI:
    def __init__(self, model_path: str):
        # Загружаем модель, порог и список фич
        with open(model_path, "rb") as f:
            saved = pickle.load(f)
        self.model = saved["model"]
        self.threshold = saved["threshold"]
        self.feature_columns = saved["features"]
        print(f"✅ Модель загружена ({len(self.feature_columns)} фичей)")

    def prepare_data(self, input_data):
        """
        Принимает:
        - dict (одна запись)
        - list[dict] (несколько записей)
        - pandas.DataFrame

        Возвращает подготовленный DataFrame с нужными фичами.
        """
        if isinstance(input_data, dict):
            df = pd.DataFrame([input_data])
        elif isinstance(input_data, list):
            df = pd.DataFrame(input_data)
        elif isinstance(input_data, pd.DataFrame):
            df = input_data.copy()
        else:
            raise ValueError("Unsupported input format")
        # Перед вызовом create_features(df)
        required_cols = [
            "order_id", "tender_id", "driver_id", "user_id",
            "order_timestamp", "tender_timestamp", "driver_reg_date",
            "platform", "carmodel", "carname",
            "duration_in_seconds", "pickup_in_seconds",
            "distance_in_meters", "pickup_in_meters",
            "price_start_local", "price_bid_local"
        ]
        for col in required_cols:
            if col not in df.columns:
                df[col] = None

        # Генерируем фичи
        df_processed = create_features(df)

        # Синхронизируем с обученными колонками
        for col in self.feature_columns:
            if col not in df_processed.columns:
                df_processed[col] = 0
        df_processed = df_processed[self.feature_columns].fillna(0)

        return df_processed

    def predict(self, input_data):
        """
        Делает предсказание по входным данным.
        Возвращает DataFrame с probability и prediction.
        """
        df_ready = self.prepare_data(input_data)

        y_proba = self.model.predict_proba(df_ready)[:, 1]
        y_pred = (y_proba >= self.threshold).astype(int)

        result = pd.DataFrame({
            "probability": y_proba,
            "prediction": y_pred
        })
        return result

# Пример использования:
api = ModelAPI("xxx_model.pkl")
sample = {
     "driver_rating": 2,
     "platform": "ios",
     "carmodel": "Toyota",
     "carname": "Camry",
     "driver_id": 123,
     "user_id": 456,
     "order_timestamp": "2024-10-01 12:30:00",
     "tender_timestamp": "2024-10-01 12:30:15",
     "driver_reg_date": "2023-01-01",
     "distance_in_meters": 3400,
     "duration_in_seconds": 420,
     "pickup_in_meters": 500,
     "pickup_in_seconds": 60,
     "price_start_local": 100,
     "price_bid_local": 1000
 }
print(api.predict(sample))
