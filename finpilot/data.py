from __future__ import annotations

from datetime import date, timedelta

import numpy as np
import pandas as pd


MERCHANTS = {
    "Travel": ["SkyJet Airlines", "Metro Hotel", "RideNow"],
    "Software": ["CloudDesk", "CodeForge", "DataHub"],
    "Office": ["Paper & Co", "Ergo Supply", "PrintWorks"],
    "Meals": ["Team Table", "Corner Cafe", "Client Bistro"],
    "Marketing": ["AdStream", "Design Studio", "EventWorks"],
}
BASE_AMOUNTS = {"Travel": 420, "Software": 145, "Office": 65, "Meals": 48, "Marketing": 260}


def normalize_transactions(raw: pd.DataFrame) -> pd.DataFrame:
    """Convert common expense-export columns into FinPilot's canonical schema."""
    normalized = raw.copy()
    normalized.columns = [str(column).strip().lower().replace(" ", "_") for column in normalized.columns]
    aliases = {
        "transaction_date": "date", "expense_date": "date", "vendor": "merchant", "merchant_name": "merchant",
        "description": "merchant", "expense_category": "category", "type": "category",
        "transaction_amount": "amount", "expense_amount": "amount", "total": "amount",
        "employee": "employee_id", "employee_name": "employee_id", "cardholder": "employee_id",
        "id": "transaction_id", "transactionid": "transaction_id",
    }
    normalized = normalized.rename(columns={source: target for source, target in aliases.items() if source in normalized.columns})
    required = {"date", "merchant", "category", "amount"}
    missing = required - set(normalized.columns)
    if missing:
        raise ValueError("CSV needs these columns: date, merchant, category, amount. Missing: " + ", ".join(sorted(missing)))
    normalized["date"] = pd.to_datetime(normalized["date"], errors="coerce")
    normalized["amount"] = pd.to_numeric(normalized["amount"].astype(str).str.replace(r"[^0-9.\-]", "", regex=True), errors="coerce")
    normalized = normalized.dropna(subset=["date", "merchant", "category", "amount"]).copy()
    normalized = normalized.loc[normalized["amount"] >= 0]
    if len(normalized) < 10:
        raise ValueError("CSV must contain at least 10 valid expense rows after cleaning.")
    normalized["date"] = normalized["date"].dt.date.astype(str)
    normalized["merchant"] = normalized["merchant"].astype(str).str.strip()
    normalized["category"] = normalized["category"].astype(str).str.strip()
    if "employee_id" not in normalized:
        normalized["employee_id"] = "Not provided"
    if "transaction_id" not in normalized:
        normalized["transaction_id"] = [f"IMPORT-{index + 1:05d}" for index in range(len(normalized))]
    normalized["known_anomaly"] = False
    normalized["anomaly_reason"] = ""
    columns = ["transaction_id", "date", "merchant", "category", "amount", "employee_id", "known_anomaly", "anomaly_reason"]
    return normalized[columns].reset_index(drop=True)


def generate_transactions(rows: int = 600, seed: int = 42) -> pd.DataFrame:
    """Generate realistic expenses and inject labelled, auditable anomalies."""
    if rows < 30:
        raise ValueError("rows must be at least 30")
    rng = np.random.default_rng(seed)
    categories = list(MERCHANTS)
    start = date.today() - timedelta(days=180)
    data = []
    for idx in range(rows):
        category = str(rng.choice(categories, p=[.16, .27, .22, .23, .12]))
        amount = max(5, rng.normal(BASE_AMOUNTS[category], BASE_AMOUNTS[category] * .32))
        txn_date = start + timedelta(days=int(rng.integers(0, 181)))
        data.append({
            "transaction_id": f"TXN-{idx + 1:05d}",
            "date": txn_date.isoformat(),
            "merchant": str(rng.choice(MERCHANTS[category])),
            "category": category,
            "amount": round(float(amount), 2),
            "employee_id": f"EMP-{int(rng.integers(1, 41)):03d}",
            "known_anomaly": False,
            "anomaly_reason": "",
        })
    frame = pd.DataFrame(data)
    anomaly_indices = rng.choice(frame.index.to_numpy(), size=max(8, rows // 45), replace=False)
    reasons = ["unusually high amount", "duplicate-like charge", "out-of-policy meal"]
    for position, index in enumerate(anomaly_indices):
        reason = reasons[position % len(reasons)]
        if reason == "duplicate-like charge" and index > 0:
            previous = frame.loc[index - 1]
            frame.loc[index, ["merchant", "category", "amount", "employee_id"]] = previous[["merchant", "category", "amount", "employee_id"]]
        elif reason == "out-of-policy meal":
            frame.loc[index, ["category", "merchant", "amount"]] = ["Meals", "Client Bistro", 185.0]
        else:
            frame.loc[index, "amount"] = round(float(frame.loc[index, "amount"] * rng.uniform(4.5, 8.0)), 2)
        frame.loc[index, ["known_anomaly", "anomaly_reason"]] = [True, reason]
    return frame.sort_values("date").reset_index(drop=True)
