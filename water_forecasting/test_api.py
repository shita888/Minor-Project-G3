import requests

url = "http://127.0.0.1:5000/predict_sector_risk"
data = {
    "population": 10000,
    "capacity": 500,
    "inflow": 200,
    "outflow": 150,
    "reservoirlevel": 50
}
response = requests.post(url, json=data)
print(response.json())