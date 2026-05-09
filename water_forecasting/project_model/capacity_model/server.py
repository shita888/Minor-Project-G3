from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
from sklearn.ensemble import RandomForestRegressor

app = Flask(__name__)
CORS(app)

MODEL_PATH = "capacity_model.pkl"
DATA_PATH = "reservoir_capacity_dataset.csv"
FEATURES = ["Rainfall_mm", "Inflow_cumecs", "Outflow_cumecs", "Runoff_Factor"]
TARGET = "Capacity_Percentage"

def train_model():
    print("Training capacity model...")
    data = pd.read_csv(DATA_PATH)
    data.columns = data.columns.str.strip()
    data.dropna(subset=FEATURES + [TARGET], inplace=True)
    
    X = data[FEATURES]
    y = data[TARGET]
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, MODEL_PATH)
    print("Model trained and saved.")
    return model

# Load or train model
if not os.path.exists(MODEL_PATH):
    model = train_model()
else:
    model = joblib.load(MODEL_PATH)

@app.route("/predict_capacity", methods=["POST"])
def predict():
    try:
        data = request.json
        
        # Extract features
        input_data = pd.DataFrame([{
            "Rainfall_mm": float(data.get("Rainfall_mm", 0)),
            "Inflow_cumecs": float(data.get("Inflow_cumecs", 0)),
            "Outflow_cumecs": float(data.get("Outflow_cumecs", 0)),
            "Runoff_Factor": float(data.get("Runoff_Factor", 0))
        }])
        
        prediction = model.predict(input_data)[0]
        
        # Limit prediction between 0 and 100
        prediction = max(0, min(100, prediction))
            
        return jsonify({
            "predicted_capacity_percentage": round(prediction, 2)
        })
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5002, debug=True)
