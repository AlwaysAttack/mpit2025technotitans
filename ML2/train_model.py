from predict import train_model
import pickle

model, threshold, feature_columns = train_model("train.csv")

with open("xxx_model.pkl", "wb") as f:
    pickle.dump({
        "model": model,
        "threshold": threshold,
        "features": feature_columns
    }, f)