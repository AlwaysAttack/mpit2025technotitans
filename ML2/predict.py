import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import roc_auc_score, accuracy_score
from catboost import CatBoostClassifier

def create_features(df):
    df = df.copy()

    if 'Unnamed: 18' in df.columns:
        df = df.drop(columns = 'Unnamed: 18')
    
    df['is_zero_distance'] = (df['distance_in_meters'] == 0).astype(int)

    for col in ['distance_in_meters', 'duration_in_seconds', 'pickup_in_meters', 
                'pickup_in_seconds', 'price_start_local', 'price_bid_local']:
        df[f'{col}_clipped'] = df[col].clip(upper=df[col].quantile(0.99))
    
    for col in ['order_timestamp', 'tender_timestamp', 'driver_reg_date']:
        df[col] = pd.to_datetime(df[col])
    
    df['order_hour'] = df['order_timestamp'].dt.hour
    df['order_dayofweek'] = df['order_timestamp'].dt.dayofweek
    df['order_day'] = df['order_timestamp'].dt.day
    df['is_night'] = df['order_hour'].isin([0, 1, 2, 3, 4, 5]).astype(int)
    df['response_time_seconds'] = (df['tender_timestamp'] - df['order_timestamp']).dt.total_seconds()
    df['driver_experience_days'] = (df['order_timestamp'] - df['driver_reg_date']).dt.days
    df['price_diff'] = df['price_bid_local'] - df['price_start_local']
    df['price_change_pct'] = (df['price_diff'] / (df['price_start_local'] + 0.1)) * 100
    df['price_increase'] = (df['price_diff'] > 0).astype(int)
    df['large_price_increase'] = (df['price_change_pct'] > 20).astype(int)
    df['price_per_km'] = df['price_bid_local_clipped'] / (df['distance_in_meters_clipped'] / 1000 + 0.1)
    df['pickup_to_distance_ratio'] = (df['pickup_in_meters_clipped'] / (df['distance_in_meters_clipped'] + 1))
    df['avg_speed'] = np.where(df['duration_in_seconds_clipped'] > 0, df['distance_in_meters_clipped'] / df['duration_in_seconds_clipped'], 0)

    df['distance_category'] = np.select(
    [
        df['distance_in_meters_clipped'] <= 1000,
        df['distance_in_meters_clipped'] <= 3000,
        df['distance_in_meters_clipped'] <= 7000,
        df['distance_in_meters_clipped'] > 7000
    ],
    [0, 1, 2, 3],
    default=-1)

    df['is_high_rating'] = (df['driver_rating'] >= 4.95).astype(int)
    df['is_ios'] = (df['platform'] == 'ios').astype(int)

    carmodel_freq = df['carmodel'].value_counts() / len(df)
    df['carmodel_freq'] = df['carmodel'].map(carmodel_freq).fillna(0)
    
    top_brands = df['carname'].value_counts().head(7).index
    df['carname_grouped'] = df['carname'].apply(lambda x: x if x in top_brands else 'Other')
    df['carname_encoded'] = LabelEncoder().fit_transform(df['carname_grouped'])

    df['driver_avg_price'] = df.groupby('driver_id')['price_bid_local'].transform('mean')
    df['user_avg_price'] = df.groupby('user_id')['price_bid_local'].transform('mean')

    df['pickup_hour_interaction'] = (df['pickup_in_meters_clipped'] * 
                                    df['order_hour'] / 100)
    
    drop_cols = [
        'order_id', 'tender_id', 'driver_id', 'user_id',
        'order_timestamp', 'tender_timestamp', 'driver_reg_date',
        'platform', 'carmodel', 'carname', 'carname_grouped',
        'duration_in_seconds', 'pickup_in_seconds',
        'distance_in_meters', 'pickup_in_meters',
        'price_start_local', 'price_bid_local'
    ]
    
    df = df.drop(columns=drop_cols, errors='ignore')

    
    if 'is_done' in df.columns:
        df['target'] = (df['is_done'] == 'done').astype(int)
        df = df.drop(columns = 'is_done')
    
    df = df.fillna(0)

    for col in df.columns:
        if df[col].dtype not in ['int64', 'float64', 'int32', 'float32']:
            try:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            except:
                df[col] = df[col].astype(int)
    
    return df

def train_model(train_path):
    df = pd.read_csv(train_path)
    df_processed = create_features(df)

    X = df_processed.drop(columns = 'target')
    y = df_processed['target']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    nan_cols = X_train.columns[X_train.isna().any()].tolist()
    if nan_cols:
        X_train = X_train.fillna(0)
        X_test = X_test.fillna(0)
    
    model = CatBoostClassifier(
        iterations=300,
        learning_rate=0.05,
        depth=7,
        scale_pos_weight=1.82,
        random_state=42,
        verbose=False
    )
    
    model.fit(X_train, y_train)
    
    print("\n" + "="*60)
    print("РЕЗУЛЬТАТЫ НА ТЕСТАХ:")
    print("="*60)
    
    THRESHOLD = 0.50
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= THRESHOLD).astype(int)
    
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"ROC-AUC: {roc_auc:.4f}")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Порог предсказания: {THRESHOLD}")
    
    return model, THRESHOLD, X.columns.tolist()


def predict(model, df_test, threshold, feature_columns):
    df_processed = create_features(df_test)

    X_test = df_processed[feature_columns]
    X_test = X_test.fillna(0)

    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= threshold).astype(int)
    
    result = df_test.copy()
    result['prediction'] = y_pred
    result['probability'] = y_pred_proba
    
    return result