from io import BytesIO

import pandas as pd
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from finpilot.data import generate_transactions, normalize_transactions
from finpilot.investigation import InvestigationAgent, transaction_by_id
from finpilot.models import AnomalyDetector, SpendForecaster

app = FastAPI(title="FinPilot AI", version="0.2.0", description="Explainable financial anomaly investigation")
_transactions = None
_data_source = "Demo dataset"


class InvestigationRequest(BaseModel):
    transaction_id: str = Field(pattern=r"^(TXN|IMPORT)-\d{5}$")


def analyzed_transactions():
    global _transactions, _data_source
    if _transactions is None:
        _transactions = AnomalyDetector().fit_predict(generate_transactions())
        _data_source = "Demo dataset"
    return _transactions


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/data-source")
def data_source():
    return {"source": _data_source, "rows": len(analyzed_transactions())}


@app.post("/transactions/upload")
async def upload_transactions(file: UploadFile = File(...)):
    """Load a local CSV export for the current in-memory analysis session."""
    global _transactions, _data_source
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Upload a CSV file.")
    try:
        raw = pd.read_csv(BytesIO(await file.read()))
        cleaned = normalize_transactions(raw)
        _transactions = AnomalyDetector().fit_predict(cleaned)
        _data_source = f"Local upload: {file.filename}"
    except (UnicodeDecodeError, ValueError, pd.errors.ParserError) as error:
        raise HTTPException(status_code=422, detail=str(error))
    return {"message": "File analyzed successfully", "rows": len(_transactions), "flagged_transactions": int(_transactions["is_anomaly"].sum()), "source": _data_source}


@app.get("/transactions")
def transactions(anomalies_only: bool = False, limit: int = Query(25, ge=1, le=100)):
    frame = analyzed_transactions()
    if anomalies_only:
        frame = frame.loc[frame["is_anomaly"]]
    return frame.head(limit).to_dict(orient="records")


@app.get("/forecast")
def forecast(days: int = Query(7, ge=1, le=30)):
    return SpendForecaster().forecast(analyzed_transactions(), days)


@app.get("/summary")
def summary():
    frame = analyzed_transactions()
    flagged = frame.loc[frame["is_anomaly"]]
    category_risk = flagged.groupby("category", as_index=False).agg(flagged_transactions=("transaction_id", "count"), flagged_spend=("amount", "sum")).sort_values("flagged_spend", ascending=False)
    return {"total_transactions": len(frame), "total_spend": round(float(frame["amount"].sum()), 2), "flagged_transactions": len(flagged), "flagged_spend": round(float(flagged["amount"].sum()), 2), "flagged_spend_pct": round(float(flagged["amount"].sum() / frame["amount"].sum() * 100), 2), "category_risk": category_risk.round(2).to_dict(orient="records")}


@app.post("/investigations")
def investigate(payload: InvestigationRequest):
    try:
        transaction = transaction_by_id(analyzed_transactions(), payload.transaction_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return InvestigationAgent().investigate(transaction)
