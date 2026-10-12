# FinPilot AI

FinPilot AI is an end-to-end financial-intelligence MVP: it generates auditable synthetic transactions, identifies anomalous spend with Isolation Forest, forecasts daily spend, retrieves policy evidence from ChromaDB, and runs a LangGraph investigation workflow exposed through FastAPI and Streamlit.

## Analyze real data locally

Open **Overview → Analyze your own expense data** and upload a CSV. FinPilot accepts `date`, `merchant`, `category`, and `amount`; it also recognizes common alternatives including `transaction_date`, `vendor`, `expense_category`, and `transaction_amount`. The file is analyzed only in the local running session and is not sent to a cloud service.

## Run locally

```bash
cd FinPilot-AI
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
uvicorn main:app --reload
```

In another terminal:

```bash
cd FinPilot-AI
source .venv/bin/activate
streamlit run dashboard.py
```

Open `http://127.0.0.1:8000/docs` for the interactive API and Streamlit's URL for the dashboard.

## API

- `GET /health` – service health
- `GET /transactions?anomalies_only=true` – scored transactions
- `GET /forecast?days=7` – daily spend forecast
- `GET /summary` – executive spend-and-risk metrics for the dashboard
- `POST /investigations` with `{"transaction_id":"TXN-00001"}` – evidence, relevant policy, verification and summary

## Architecture

`Synthetic data → Isolation Forest → FastAPI → LangGraph investigation → ChromaDB policy retrieval → Streamlit dashboard`

The product is deliberately deterministic and offline-capable for interview demos. ChromaDB is used for persistent policy retrieval; a lexical fallback keeps the application usable when a native Chroma dependency cannot load.
