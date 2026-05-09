# 💧 Aqua Forecast - AI-Powered Water Resource Management System

> A comprehensive, full-stack web application leveraging Machine Learning to predict water demand, forecast reservoir capacity, and perform sector-wise risk assessments. Designed to empower urban planners, researchers, and local authorities with proactive, data-driven water management decisions.

---

## 📋 Table of Contents

- [Overview & Purpose](#-overview--purpose)
- [Aim & Objectives](#-aim--objectives)
- [Key Features](#-key-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Project Structure](#-project-structure)
- [Machine Learning Models Details](#-machine-learning-models-details)
- [How to Access & Run Locally](#-how-to-access--run-locally)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Team](#-team)

---

## 📖 Overview & Purpose

**Aqua Forecast** was developed as a Minor Project to address the growing challenges of urban water management. As cities expand and climate change disrupts traditional weather patterns, relying on historical averages for water supply and demand is no longer sufficient. 

**The Purpose:** 
The core purpose of this project is to bridge the gap between complex machine learning algorithms and practical, day-to-day urban planning. By taking into account real-time and historical data—such as population density, temperature, rainfall, and reservoir levels—Aqua Forecast provides actionable insights. 

**Who is this for?**
- **Urban Planners & Municipalities:** To foresee potential water shortages in specific sectors and allocate resources efficiently.
- **Water Treatment Authorities:** To estimate reservoir capacities based on rainfall and runoff factors, ensuring safe operational levels.
- **Environmental Researchers:** To study the correlations between climate conditions and urban water consumption patterns.

---

## 🎯 Aim & Objectives

### Aim
To engineer an accessible, highly accurate, and AI-powered water resource management ecosystem that provides real-time predictions for water demand, reservoir storage capacity, and sector-specific risk levels, ultimately fostering sustainable water distribution.

### Core Objectives
1. **Intelligent Water Demand Forecasting:** Predict accurate water consumption needs dynamically by evaluating factors like seasonal changes, temperature variations, city demographics, and historical trends.
2. **Reservoir Capacity Estimation:** Calculate the expected capacity percentage of local reservoirs based on rainfall metrics, inflow/outflow dynamics, and regional runoff factors.
3. **Sector-Wise Risk Evaluation:** Identify vulnerable urban sectors and assign a risk classification (Low / Medium / High) based on supply-demand gaps and current storage levels.
4. **Seamless User Experience:** Deliver an intuitive, aesthetically pleasing (glassmorphism & ocean-themed) web interface that requires zero technical ML expertise to operate.
5. **Unified API Infrastructure:** Centralize all machine learning predictions through a single, high-performance FastAPI backend.

---

## 🌟 Key Features

- **Unified FastAPI Backend:** Previously a multi-service architecture, now seamlessly integrated into a single, high-concurrency API server.
- **Large Model Handling:** Implements automatic chunk-recombination for massive ML models (e.g., bypassing GitHub's 100MB LFS limits natively).
- **Responsive Web Design:** Features a premium glassmorphism aesthetic with dynamic, animated weather/rain elements for an immersive user experience.
- **Real-Time Inference:** Instantaneous predictions powered by serialized `scikit-learn` models (`.pkl`).

---

## 🛠️ Tech Stack & Architecture

### Frontend & Web Interface
| Technology | Purpose |
|---|---|
| **HTML5 / CSS3** | Structural layout and premium glassmorphism styling |
| **JavaScript (Vanilla)** | Client-side logic, routing logic, and dynamic DOM animations |

### Backend & API Architecture
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance, async-ready Python web framework |
| **Uvicorn** | ASGI server for handling concurrent HTTP requests |
| **Pydantic** | Strict data validation and settings management for API payloads |

### Machine Learning & Data Processing
| Technology | Purpose |
|---|---|
| **scikit-learn** | Model training and inference (RandomForestRegressor) |
| **pandas / NumPy** | Complex data manipulation, feature extraction, and preprocessing |
| **joblib** | Efficient model serialization and disk persistence |

---

## 📁 Project Structure

```text
Minor-project/
│
├── main.py                         # 🚀 Unified FastAPI Server (Main Entry Point & Routes)
├── requirements.txt                # Python backend dependencies
├── nixpacks.toml                   # Cloud Deployment configuration (e.g., Railway)
├── README.md                       # Documentation
│
├── project_model/                  # 🤖 ML Models Directory
│   ├── WaterDemandPrediction_Model/ # Contains water_model.pkl & columns.pkl
│   ├── capacity_model/              # Contains chunked capacity_model.pkl.part* files
│   └── sector_model/                # Contains sector_model.pkl
│
├── public/                         # 🎨 Frontend Assets (Static Files)
│   ├── HTML_File/                  # Core templates (index, menu, prediction pages)
│   ├── CSS_File/                   # Stylesheets & themes
│   └── JavaScript_File/            # Interactive scripts & API integration
│
└── scratch/                        # 🛠️ Utility scripts (e.g., model splitting tools)
```

---

## 🤖 Machine Learning Models Details

### 1. Water Demand Prediction Model
- **Algorithm:** Random Forest Regressor
- **Purpose:** Estimates the total volume of water required by a specific city.
- **Key Inputs:** Temperature, Rainfall, Population, Reservoir Level, Water Tariff, Holiday status, historical lags (lag_1, lag_7), City, and Season.

### 2. Reservoir Capacity Prediction Model
- **Algorithm:** Random Forest Regressor
- **Purpose:** Forecasts the percentage fill-level of a water reservoir.
- **Technical Note:** Because the raw model size exceeds 268MB, it is split into `.part` chunks. The backend automatically recombines these parts in memory upon server startup.
- **Key Inputs:** Rainfall (mm), Inflow (cumecs), Outflow (cumecs), and Runoff Factor.

### 3. Sector-Wise Risk Assessment Model
- **Algorithm:** Random Forest Regressor
- **Purpose:** Calculates the supply-to-demand ratio to evaluate risk.
- **Risk Logic:** 
  - Risk Ratio > 0.8 ➡️ **High Risk**
  - Risk Ratio > 0.5 ➡️ **Medium Risk**
  - Otherwise ➡️ **Low Risk**
- **Key Inputs:** Population, Max Capacity, Inflow, Outflow, and Current Reservoir Level.

---

## 🚀 How to Access & Run Locally

Follow these detailed steps to set up and run the Aqua Forecast system on your local machine.

### Step 1: Prerequisites
Ensure you have the following installed on your system:
- **Python 3.8 or higher** (Check by running `python --version` in your terminal)
- **Git** (For cloning the repository)

### Step 2: Clone the Repository
Open your terminal or command prompt and run:
```bash
git clone <your-repository-url>
cd Minor-project
```

### Step 3: Create a Virtual Environment (Recommended)
It is highly recommended to use a virtual environment to isolate project dependencies.
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 4: Install Dependencies
Install all required Python packages listed in the requirements file:
```bash
pip install -r requirements.txt
```

### Step 5: Start the Server
Launch the FastAPI server using Uvicorn (handled directly inside `main.py`):
```bash
python main.py
```

### Step 6: Access the Application
Once the server indicates it is running (you should see `Uvicorn running on http://0.0.0.0:8080`), open your preferred web browser and navigate to:
**👉 http://localhost:8080**

---

## 📘 Usage Guide

### 1. The Landing Page
When you access the application, you will be greeted by the **"Welcome to Aqua Forecast"** landing screen, complete with ocean-themed aesthetics and dynamic rain effects. 
- Click the **"Explore Aqua Forecast"** button to enter the main dashboard.

### 2. The Main Menu
The dashboard presents you with three distinct prediction modules. Choose the tool that fits your current need:
- **Predict Capacity:** If you need to know how full a reservoir will get based on upcoming weather and flow data.
- **Predict Water Demand:** If you need to estimate how much water a city will consume based on seasonal and demographic factors.
- **Predict Sector Wise Risk:** If you want to evaluate if a specific local sector is in danger of a water shortage.

### 3. Making a Prediction
1. Click on your chosen module card.
2. You will be taken to a specialized form. Fill in **all** the required numerical and categorical fields (e.g., Temperature, Rainfall, City).
3. Click the **"Predict"** or **"Assess Risk"** button at the bottom of the form.
4. The frontend will communicate with the FastAPI backend, process your data through the ML models, and display the result instantly on your screen!

> ⚠️ **Note:** On the very first startup, the Capacity Model takes a few moments to stitch its chunks together. Please be patient if the first request takes a few extra seconds.

---

## 🔗 API Documentation

If you wish to integrate Aqua Forecast's predictions into another application, you can interact directly with the FastAPI endpoints.

### 1. Water Demand Prediction
- **Endpoint:** `POST /predict_water`
- **Headers:** `Content-Type: application/json`
- **Body Example:**
```json
{
  "Temperature": 35.5,
  "Rainfall": 12.0,
  "Population": 2500000,
  "Reservoir_Level": 70.5,
  "Water_Tariff": 15.0,
  "Holiday": 0,
  "lag_1": 510.0,
  "lag_7": 490.0,
  "City": "Bhopal",
  "Season": "Summer"
}
```

### 2. Reservoir Capacity Prediction
- **Endpoint:** `POST /predict_capacity`
- **Headers:** `Content-Type: application/json`
- **Body Example:**
```json
{
  "Rainfall_mm": 150.0,
  "Inflow_cumecs": 1200.5,
  "Outflow_cumecs": 800.0,
  "Runoff_Factor": 0.45
}
```

### 3. Sector Risk Assessment
- **Endpoint:** `POST /predict_sector`
- **Headers:** `Content-Type: application/json`
- **Body Example:**
```json
{
  "population": 500000,
  "capacity": 1000,
  "inflow": 55,
  "outflow": 42,
  "reservoirlevel": 65
}
```

---

## 🔧 Troubleshooting

| Issue | Potential Cause | Solution |
|---|---|---|
| **Model files not found on startup** | Repository was cloned without LFS or chunks are missing. | Ensure you pulled the repository completely. Verify that `capacity_model` contains `.part` files. |
| **`ModuleNotFoundError: No module named 'fastapi'`** | Dependencies are not installed. | Run `pip install -r requirements.txt` within your active virtual environment. |
| **Port 8080 already in use** | Another application is using the port. | Change the port in `main.py` at the bottom (`os.environ.get("PORT", 8080)`) or kill the conflicting process. |
| **"Error connecting to prediction server" on UI** | The frontend is trying to reach a different port. | Ensure you are accessing the UI via the FastAPI server (`http://localhost:8080`) rather than directly opening the HTML file from your file explorer. |

---

## 👥 Team

This project was brought to life by the following members:
- **Prayagi Sahajwani**
- **Sanskrati Kachole**
- **Sheetal Narwariya**
- **Sejal Soni**

**Minor Project — Aqua Forecast**
