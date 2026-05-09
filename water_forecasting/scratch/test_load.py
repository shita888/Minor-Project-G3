import joblib
import os

base = r"c:\Users\Lenovo\OneDrive\Documents\MINOR\Minor-project\project_model\WaterDemandPrediction_Model"
model_path = os.path.join(base, "water_model.pkl")
cols_path = os.path.join(base, "columns.pkl")

try:
    print(f"Loading model from {model_path}")
    m = joblib.load(model_path)
    print("Model loaded.")
    
    print(f"Loading columns from {cols_path}")
    c = joblib.load(cols_path)
    print("Columns loaded.")
    print("ALL SUCCESSFUL")
except Exception as e:
    print(f"FAILED: {e}")
