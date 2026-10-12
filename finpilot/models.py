from __future__ import annotations

import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression


class AnomalyDetector:
    def __init__(self, contamination: float = 0.04, random_state: int = 42):
        self.model = IsolationForest(contamination=contamination, random_state=random_state)

    def fit_predict(self, transactions: pd.DataFrame) -> pd.DataFrame:
        required = {"amount", "category", "date"}
        if not required.issubset(transactions.columns):
            raise ValueError(f"transactions require columns: {sorted(required)}")
        result = transactions.copy()
        dates = pd.to_datetime(result["date"])
        features = pd.DataFrame({
            "amount": result["amount"].astype(float),
            "category": pd.factorize(result["category"])[0],
            "weekday": dates.dt.dayofweek,
        })
        labels = self.model.fit_predict(features)
        scores = -self.model.decision_function(features)
        result["is_anomaly"] = labels == -1
        result["anomaly_score"] = scores.round(4)
        return result.sort_values("anomaly_score", ascending=False).reset_index(drop=True)


class SpendForecaster:
    """A transparent seven-day linear trend forecast over daily spend."""
    def forecast(self, transactions: pd.DataFrame, days: int = 7) -> list[dict]:
        if days < 1:
            raise ValueError("days must be positive")
        daily = transactions.copy()
        daily["date"] = pd.to_datetime(daily["date"])
        grouped = daily.groupby("date", as_index=False)["amount"].sum().sort_values("date")
        full_dates = pd.date_range(grouped["date"].min(), grouped["date"].max(), freq="D")
        grouped = grouped.set_index("date").reindex(full_dates, fill_value=0).rename_axis("date").reset_index()
        x = pd.DataFrame({"day": range(len(grouped))})
        model = LinearRegression().fit(x, grouped["amount"])
        future_x = pd.DataFrame({"day": range(len(grouped), len(grouped) + days)})
        predictions = model.predict(future_x).clip(min=0)
        next_day = grouped["date"].max() + pd.Timedelta(days=1)
        return [
            {"date": (next_day + pd.Timedelta(days=i)).date().isoformat(), "predicted_spend": round(float(value), 2)}
            for i, value in enumerate(predictions)
        ]
