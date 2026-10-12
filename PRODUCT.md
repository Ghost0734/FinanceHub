# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Finance operations analysts, expense auditors, and finance managers at mid-sized to enterprise companies. They need to triage unusual expenses quickly, understand why an item was flagged, and choose an appropriate next action without searching through spreadsheets or policy documents.

## Product Purpose

FinPilot AI helps finance teams investigate spending risk. It detects unusual expenses, forecasts near-term spend, retrieves relevant policy evidence, and presents a clear, confidence-aware recommendation so people can make defensible decisions quickly.

## Positioning

FinPilot does more than flag a transaction: it combines ML-based anomaly detection, spending forecasts, policy retrieval, and an investigation workflow to explain the evidence, surface the applicable policy, recommend a next action, and communicate confidence plainly.

## Operating Context

Users work in finance-operations and audit workflows, often alongside spreadsheet exports and company policy documents. They upload a CSV export, triage a review queue, investigate individual expenses, assess evidence and policy, then decide whether to review, document, or escalate the item.

## Capabilities and Constraints

- Preserve the FastAPI and Streamlit architecture and all existing functions: overview, investigation, forecasting, policy evidence, and CSV upload.
- Accept locally uploaded expense CSVs during the MVP session; uploaded financial data must stay local and must not be sent to an external service.
- Continue supporting local execution and Docker. Cloud deployment is a future possibility, not a current claim.
- Explain risk in plain language for non-technical users and make confidence visible.

## Brand Commitments

FinPilot AI should feel like an intelligent finance-risk assistant, never a generic analytics dashboard. Its future identity is restrained and premium: deep navy or charcoal foundation; limited teal or emerald for positive/action states; amber and red reserved for risk severity. Avoid flashy “AI” styling.

## Evidence on Hand

- Existing Streamlit dashboard, FastAPI service, deterministic synthetic dataset, anomaly detector, forecast, policy retrieval, and investigation workflow are in this repository.
- `README.md` documents local-only CSV processing, supported API endpoints, local setup, Docker support, and the offline-capable MVP architecture.
- No established logo, brand system, customer testimonials, external benchmarks, or cloud-deployment proof is available. Do not fabricate any of these.

## Product Principles

1. Make financial risk understandable before making it actionable.
2. Pair every material risk signal with evidence, relevant policy, and a clear next step.
3. Treat user trust and local-data privacy as product features.
4. Favor calm, auditable decision support over opaque automation.
5. Reduce investigation time without obscuring uncertainty.

## Accessibility & Inclusion

Use accessible contrast and readable typography, support keyboard-friendly controls, and never communicate risk with color alone.
