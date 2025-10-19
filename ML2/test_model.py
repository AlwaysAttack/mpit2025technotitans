from predict import predict
import pandas as pd
import pickle

with open("xxx_model.pkl", "rb") as f:
    data = pickle.load(f)
    model = data['model']
    threshold = data['threshold']
    feature_columns = data['features']

df_test = pd.read_csv("test.csv")
df_result = predict(model, df_test, threshold, feature_columns)
df_result.rename(columns={'prediction': 'is_done'}, inplace=True)
df_result['is_done'] = df_result['is_done'].apply(lambda x: 'done' if x == 1 else 'cancel')


df_result['is_done'].to_csv("predictions.csv", index=False)
df_result['probability'].to_csv("probabilities.csv", index=False)