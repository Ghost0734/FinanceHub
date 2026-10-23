# FinPilot AI

<h3 align="center">AI-Powered Financial Intelligence</h3>

<p align="center">
  Detect anomalous expenses, forecast spending, and investigate transactions with policy-backed evidence.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white" alt="Streamlit"/>
  <img src="https://img.shields.io/badge/Scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" alt="Scikit-learn"/>
  <img src="https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge" alt="LangGraph"/>
  <img src="https://img.shields.io/badge/ChromaDB-Storage-5B4BDB?style=for-the-badge" alt="ChromaDB"/>
</p>

---

## Overview

FinPilot AI is an end-to-end financial intelligence MVP that transforms expense transactions into actionable insights.

It combines machine learning, policy retrieval, and graph-based investigation workflows to identify unusual spending, forecast daily expenditure, and generate evidence-backed investigation summaries.

## Features

| Feature | Description |
|---|---|
| Anomaly Detection | Identify unusual transactions using Isolation Forest. |
| Spend Forecasting | Forecast daily spending to understand expenditure trends. |
| Policy Intelligence | Retrieve relevant financial policy evidence using ChromaDB. |
| AI Investigations | Orchestrate transaction investigations using LangGraph. |
| Interactive Dashboard | Explore spending summaries, anomalies, forecasts, and investigations through Streamlit. |
| CSV Analysis | Upload and analyze your own expense data locally. |
| REST API | Access transaction analysis, forecasts, summaries, and investigations through FastAPI. |

## Architecture

<p align="center">
  <a href="https://gitdiagram.com/ghost0734/financehub">
    <img src="https://gitdiagram.com/ghost0734/financehub/diagram.png" alt="FinPilot AI system architecture" width="100%"/>
  </a>
</p>

<p align="center">
  <em>Explore the interactive architecture diagram.</em>
</p>

## Tech Stack

- **Backend:** Python, FastAPI, Uvicorn
- **Machine Learning:** Scikit-learn, Isolation Forest, Linear Regression
- **AI Orchestration:** LangGraph
- **Policy Retrieval:** ChromaDB with lexical fallback
- **Dashboard:** Streamlit
- **Data Processing:** Pandas
- **Testing:** Pytest
- **Deployment:** Docker, AWS, GitHub Actions

## Getting Started

### Prerequisites

- Python and a compatible environment for the project dependencies
- Git
- A virtual environment

### Installation

Clone the repository:

```bash
git clone https://github.com/Ghost0734/FinanceHub.git
cd FinanceHub
```

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install dependencies and run the tests:

```bash
pip install -r requirements.txt
pytest -q
```

### Run the application

Start the FastAPI backend:

```bash
uvicorn main:app --reload
```

In a separate terminal, activate the same virtual environment and start the Streamlit dashboard:

```bash
streamlit run dashboard.py
```

| Service | URL |
|---|---|
| API | `http://127.0.0.1:8000` |
| Interactive API docs | `http://127.0.0.1:8000/docs` |
| Health check | `http://127.0.0.1:8000/health` |

Open the local URL printed by Streamlit to access the dashboard.

## Analyze Your Own Expense Data

1. Navigate to **Overview → Analyze your own expense data**.
2. Upload a CSV containing expense transactions.
3. Review the resulting analysis and flagged transactions.

### Supported CSV columns

| Column | Description |
|---|---|
| `date` | Transaction date |
| `merchant` | Merchant or vendor |
| `category` | Expense category |
| `amount` | Transaction amount |

Common alternatives include `transaction_date`, `vendor`, `expense_category`, and `transaction_amount`.

**Privacy:** The documented local CSV workflow processes uploaded data within the running application session and does not send the uploaded file to a cloud analytics service.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Check service health |
| `GET` | `/transactions?anomalies_only=true` | Retrieve flagged transactions |
| `GET` | `/forecast?days=7` | Retrieve a daily spend forecast |
| `GET` | `/summary` | Retrieve executive spending and risk metrics |
| `POST` | `/investigations` | Investigate a transaction |

### Example investigation request

```json
{
  "transaction_id": "TXN-00001"
}
```

Send this JSON body to `POST /investigations`. The workflow is designed to assemble transaction findings, relevant policy evidence, verification details, and an investigation summary.

Visit `/docs` for the live API schema and request details.

## How It Works

```text
Synthetic Transactions
        ↓
Transaction Preparation
        ↓
Isolation Forest + Spend Forecasting
        ↓
FastAPI Analysis Service
        ↓
LangGraph Investigation Workflow
        ↓
ChromaDB Policy Retrieval
        ↓
Evidence-Backed Investigation Results
```

The application is designed to be deterministic and suitable for local interview demonstrations. ChromaDB provides policy retrieval, while a lexical fallback supports environments where the native ChromaDB dependency cannot load.

## Testing

Run the backend test suite:

```bash
pytest -q
```

## Deployment

The repository includes Docker configurations and GitHub Actions workflows for automated AWS deployment using OpenID Connect (OIDC).

Refer to `Dockerfile`, `compose.yaml`, `compose.prod.yaml`, and `.github/workflows/` for deployment details.

## Limitations

FinPilot AI is an MVP intended for experimentation and demonstrations. An anomaly flag does not establish fraud, forecasts are estimates, and policy evidence should be reviewed before making financial or compliance decisions.

---

<p align="center">
  <strong>FinPilot AI</strong><br/>
  Turning financial data into actionable intelligence.
</p>
