from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
from sklearn.ensemble import RandomForestRegressor

app = Flask(__name__)
CORS(app)

MODEL_PATH = "sector_model.pkl"
DATA_PATH = "newDataset_with_demand.csv"
FEATURES = ["population", "capacity", "inflow", "outflow", "reservoirlevel"]
TARGET = "Water_Demand"

def train_model():
    print("Training model...")
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

@app.route("/predict_risk", methods=["POST"])
def predict():
    try:
        data = request.json
        
        # Extract features
        input_data = pd.DataFrame([{
            "population": float(data.get("population", 0)),
            "capacity": float(data.get("capacity", 0)),
            "inflow": float(data.get("inflow", 0)),
            "outflow": float(data.get("outflow", 0)),
            "reservoirlevel": float(data.get("reservoirlevel", 0))
        }])
        
        prediction = model.predict(input_data)[0]
        
        # For "Risk Assessment", let's formulate a risk score based on demand vs capacity
        # Or just return the raw prediction and let the frontend show it.
        # Let's return both the predicted demand and a dummy risk metric.
        capacity = float(data.get("capacity", 1))
        if capacity == 0: capacity = 1
        risk_ratio = prediction / capacity
        
        if risk_ratio > 0.8:
            risk_level = "High Risk"
        elif risk_ratio > 0.5:
            risk_level = "Medium Risk"
        else:
            risk_level = "Low Risk"
            
        return jsonify({
            "predicted_demand": round(prediction, 2),
            "risk_level": risk_level,
            "risk_ratio": round(risk_ratio, 2)
        })
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)
