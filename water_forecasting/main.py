import joblib
import pandas as pd
import numpy as np
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="Aqua Forecast API")
app.mount("/static", StaticFiles(directory="public"), name="static")
# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Helper: Safe Model Loading
# -------------------------------
def load_model(path):
    abs_path = os.path.abspath(path)
    try:
        if os.path.exists(abs_path):
            size = os.path.getsize(abs_path)
            print(f"DEBUG: File {abs_path} exists. Size: {size} bytes")
            
            if size < 1000:
                print(f"🚨 WARNING: {abs_path} is very small ({size} bytes). It might be a Git LFS pointer instead of the actual model!")
            
            model = joblib.load(abs_path)
            print(f"✅ Loaded model from: {abs_path}")
            return model
        else:
            print(f"⚠️ Model NOT found at: {abs_path}")
            return None
    except Exception as e:
        print(f"❌ Error loading {abs_path}: {e}")
        return None

def join_chunks(file_path):
    parts = sorted([f for f in os.listdir(os.path.dirname(file_path)) if f.startswith(os.path.basename(file_path) + ".part")])
    if not parts:
        return file_path
    
    print(f"🧩 Recombining {len(parts)} chunks for {file_path}...")
    with open(file_path, 'wb') as output_file:
        for part in parts:
            part_path = os.path.join(os.path.dirname(file_path), part)
            with open(part_path, 'rb') as input_file:
                output_file.write(input_file.read())
    return file_path

# -------------------------------
# Paths & Model Loading
# -------------------------------
BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "project_model")

# Water Model
water_model_path = os.path.join(BASE_DIR, "WaterDemandPrediction_Model", "water_model.pkl")
water_cols_path = os.path.join(BASE_DIR, "WaterDemandPrediction_Model", "columns.pkl")

# Sector Model
sector_model_path = os.path.join(BASE_DIR, "sector_model", "sector_model.pkl")

# Capacity Model
capacity_model_path = os.path.join(BASE_DIR, "capacity_model", "capacity_model.pkl")

water_model = load_model(water_model_path)
water_cols = load_model(water_cols_path)
sector_model = load_model(sector_model_path)

# Recombine and load large capacity model
join_chunks(capacity_model_path)
capacity_model = load_model(capacity_model_path)

# Feature Definitions (for ordering)
SECTOR_FEATURES = ["population", "capacity", "inflow", "outflow", "reservoirlevel"]
CAPACITY_FEATURES = ["Rainfall_mm", "Inflow_cumecs", "Outflow_cumecs", "Runoff_Factor"]

# -------------------------------
# Pydantic Schemas
# -------------------------------
class WaterDemandInput(BaseModel):
    Temperature: float
    Rainfall: float
    Population: float
    Reservoir_Level: float
    Water_Tariff: float
    Holiday: int = 0
    lag_1: float
    lag_7: float
    City: str
    Season: str

class SectorRiskInput(BaseModel):
    population: float
    capacity: float
    inflow: float
    outflow: float
    reservoirlevel: float

class CapacityInput(BaseModel):
    Rainfall_mm: float
    Inflow_cumecs: float
    Outflow_cumecs: float
    Runoff_Factor: float


# -------------------------------
# Routes
# -------------------------------

@app.get("/status")
def home():
    return {
        "status": "API running 🚀",
        "models_loaded": {
            "water": water_model is not None,
            "sector": sector_model is not None,
            "capacity": capacity_model is not None
        }
    }


@app.get('/')
def read_root():
    return FileResponse('public/HTML_File/index.html')

@app.get('/menu.html')
def menu_page():
    return FileResponse('public/HTML_File/menu.html')

@app.get('/predict_capacity.html')
def predict_capacity_page():
    return FileResponse('public/HTML_File/predict_capacity.html')

@app.get('/predict_water_demand.html')
def predict_water_demand_page():
    return FileResponse('public/HTML_File/predict_water_demand.html')

@app.get('/predict_sector_risk.html')
def predict_sector_risk_page():
    return FileResponse('public/HTML_File/predict_sector_risk.html')
# --- Water Prediction ---
@app.post("/predict_water")
async def predict_water(data: WaterDemandInput):
    try:
        if water_model is None or water_cols is None:
            return {"error": "Water model or feature columns not loaded"}

        # Prepare DataFrame using model dict representation
        df = pd.DataFrame([data.model_dump()])
        
        # Handle dummies (One-hot encoding for City, Season, etc.)
        df = pd.get_dummies(df)
        
        # Reindex to match training columns
        df = df.reindex(columns=water_cols, fill_value=0)

        prediction = water_model.predict(df)[0]
        return {"prediction": int(prediction)}

    except Exception as e:
        return {"error": str(e)}

# --- Sector Risk Prediction ---
@app.post("/predict_sector")
async def predict_sector(data: SectorRiskInput):
    try:
        if sector_model is None:
            return {"error": "Sector model not loaded"}

        # Safe feature extraction based on predefined order
        input_data = pd.DataFrame([{
            f: getattr(data, f, 0) for f in SECTOR_FEATURES
        }])

        prediction = sector_model.predict(input_data)[0]
        
        # Risk Logic
        capacity = data.capacity or 1
        risk_ratio = prediction / capacity
        
        if risk_ratio > 0.8: risk_level = "High Risk"
        elif risk_ratio > 0.5: risk_level = "Medium Risk"
        else: risk_level = "Low Risk"

        return {
            "predicted_demand": round(float(prediction), 2),
            "risk_level": risk_level,
            "risk_ratio": round(float(risk_ratio), 2)
        }

    except Exception as e:
        return {"error": str(e)}

# --- Capacity Prediction ---
@app.post("/predict_capacity")
async def predict_capacity(data: CapacityInput):
    try:
        if capacity_model is None:
            return {"error": "Capacity model not loaded"}

        # Safe feature extraction
        input_data = pd.DataFrame([{
            f: getattr(data, f, 0) for f in CAPACITY_FEATURES
        }])

        prediction = capacity_model.predict(input_data)[0]
        prediction = max(0, min(100, float(prediction))) # Clamp 0-100%

        return {"predicted_capacity_percentage": round(prediction, 2)}

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)