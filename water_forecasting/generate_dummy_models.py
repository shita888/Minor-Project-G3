# Cleaned Dummy model generator
from sklearn.linear_model import LinearRegression
import joblib
import os

# Base directory for models
BASE_DIR = 'project_model'

# Ensure correct directories exist
os.makedirs(os.path.join(BASE_DIR, 'sector_model'), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'capacity_model'), exist_ok=True)

# Create dummy models
sector_model = LinearRegression()
capacity_model = LinearRegression()

# Dummy fit to avoid errors (at least 1 sample)
import numpy as np
X = np.array([[100, 100, 10, 10, 50]]) # population, capacity, inflow, outflow, reservoirlevel
y = np.array([150])
sector_model.fit(X, y)

X_cap = np.array([[100, 50, 40, 0.5]]) # Rainfall, Inflow, Outflow, Runoff
y_cap = np.array([75])
capacity_model.fit(X_cap, y_cap)

# Save models to the correct paths used by main.py
joblib.dump(sector_model, os.path.join(BASE_DIR, 'sector_model', 'sector_model.pkl'))
joblib.dump(capacity_model, os.path.join(BASE_DIR, 'capacity_model', 'capacity_model.pkl'))

print('✅ Cleaned dummy models created in correct directories.')
