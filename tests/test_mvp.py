from fastapi.testclient import TestClient

from finpilot.data import generate_transactions
from finpilot.models import AnomalyDetector, SpendForecaster
from main import app


def test_generation_and_detection():
    data = generate_transactions(rows=120, seed=7)
    analyzed = AnomalyDetector().fit_predict(data)
    assert len(analyzed) == 120
    assert analyzed["is_anomaly"].sum() >= 1
    assert {"anomaly_score", "known_anomaly"}.issubset(analyzed.columns)


def test_forecast_shape():
    forecast = SpendForecaster().forecast(generate_transactions(rows=80), days=5)
    assert len(forecast) == 5
    assert all(item["predicted_spend"] >= 0 for item in forecast)


def test_api_investigation():
    client = TestClient(app)
    assert client.get("/health").json() == {"status": "ok"}
    summary = client.get("/summary")
    assert summary.status_code == 200
    assert summary.json()["flagged_transactions"] > 0
    transaction_id = client.get("/transactions", params={"limit": 1}).json()[0]["transaction_id"]
    response = client.post("/investigations", json={"transaction_id": transaction_id})
    assert response.status_code == 200
    assert "verification" in response.json()


def test_upload_realistic_csv():
    client = TestClient(app)
    rows = "transaction_date,vendor,expense_category,transaction_amount,employee\n" + "\n".join(
        f"2026-10-{(index % 28) + 1:02d},Vendor {index},Travel,{100 + index},Employee {index % 3}"
        for index in range(12)
    )
    response = client.post("/transactions/upload", files={"file": ("expenses.csv", rows, "text/csv")})
    assert response.status_code == 200
    assert response.json()["rows"] == 12
    assert client.get("/data-source").json()["source"] == "Local upload: expenses.csv"
