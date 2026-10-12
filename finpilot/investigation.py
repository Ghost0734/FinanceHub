from __future__ import annotations

from typing import TypedDict

import pandas as pd

from .rag import PolicyRetriever


class InvestigationState(TypedDict, total=False):
    transaction: dict
    evidence: list[dict]
    policies: list[dict]
    verification: dict
    summary: str


def _evidence(state: InvestigationState) -> InvestigationState:
    tx = state["transaction"]
    evidence = [{"type": "transaction", "detail": f"{tx['merchant']} charged ${float(tx['amount']):,.2f} for {tx['category']}."}]
    return {"evidence": evidence}


def _retrieve(state: InvestigationState) -> InvestigationState:
    tx = state["transaction"]
    query = f"{tx['category']} ${tx['amount']} {tx['merchant']} receipt approval duplicate"
    return {"policies": PolicyRetriever().search(query)}


def _verify(state: InvestigationState) -> InvestigationState:
    tx, policies = state["transaction"], state["policies"]
    amount, category = float(tx["amount"]), str(tx["category"])
    flags = []
    if amount > 25:
        flags.append("itemized receipt required")
    if category == "Meals" and amount > 75:
        flags.append("manager approval required")
    if category == "Meals" and amount > 150:
        flags.append("potentially non-reimbursable meal")
    if amount > 1500:
        flags.append("finance review required")
    confidence = min(.98, .55 + .1 * len(flags) + (.15 if tx.get("is_anomaly") else 0))
    return {"verification": {"flags": flags, "policy_ids": [p["policy_id"] for p in policies], "confidence": round(confidence, 2)}}


def _summarize(state: InvestigationState) -> InvestigationState:
    tx, verification = state["transaction"], state["verification"]
    flag_text = "; ".join(verification["flags"]) or "no explicit policy breach found"
    return {"summary": f"Investigated {tx['transaction_id']}: ${float(tx['amount']):,.2f} at {tx['merchant']}. Findings: {flag_text}."}


class InvestigationAgent:
    def __init__(self) -> None:
        self.engine = "sequential"
        try:
            from langgraph.graph import END, START, StateGraph
            graph = StateGraph(InvestigationState)
            graph.add_node("evidence", _evidence)
            graph.add_node("retrieve", _retrieve)
            graph.add_node("verify", _verify)
            graph.add_node("summarize", _summarize)
            graph.add_edge(START, "evidence")
            graph.add_edge("evidence", "retrieve")
            graph.add_edge("retrieve", "verify")
            graph.add_edge("verify", "summarize")
            graph.add_edge("summarize", END)
            self.graph = graph.compile()
            self.engine = "langgraph"
        except Exception:
            self.graph = None

    def investigate(self, transaction: dict) -> dict:
        if self.graph:
            return dict(self.graph.invoke({"transaction": transaction}))
        state: InvestigationState = {"transaction": transaction}
        for step in (_evidence, _retrieve, _verify, _summarize):
            state.update(step(state))
        return dict(state)


def transaction_by_id(transactions: pd.DataFrame, transaction_id: str) -> dict:
    match = transactions.loc[transactions["transaction_id"] == transaction_id]
    if match.empty:
        raise KeyError(transaction_id)
    return match.iloc[0].to_dict()
