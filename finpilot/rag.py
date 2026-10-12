from __future__ import annotations

import hashlib
import re
from pathlib import Path

DEFAULT_POLICIES = [
    ("meal-limit", "Meals above $75 require a client name and manager approval. Meals above $150 are not reimbursable without VP approval."),
    ("duplicate-charge", "Employees must report duplicate or suspected duplicate charges within five business days. Finance should hold reimbursement pending verification."),
    ("travel-review", "Airfare and lodging expenses exceeding $1,500 require a documented business purpose and finance review."),
    ("receipt-rule", "Expenses above $25 require an itemized receipt and a valid business purpose."),
]


def _tokens(value: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", value.lower()))


class PolicyRetriever:
    """Policy retrieval with a dependency-free lexical fallback and persistent Chroma store."""
    def __init__(self, persist_directory: str | Path = ".finpilot_chroma"):
        self.policies = DEFAULT_POLICIES
        self.collection = None
        try:
            import chromadb
            client = chromadb.PersistentClient(path=str(persist_directory))
            self.collection = client.get_or_create_collection("finpilot_policies", embedding_function=None)
            self.collection.upsert(
                ids=[policy_id for policy_id, _ in self.policies],
                documents=[text for _, text in self.policies],
                embeddings=[self._embedding(text) for _, text in self.policies],
            )
        except Exception:
            # The investigation still works offline if Chroma's native library is unavailable.
            self.collection = None

    @staticmethod
    def _embedding(text: str, dimensions: int = 64) -> list[float]:
        vector = [0.0] * dimensions
        for token in _tokens(text):
            vector[int(hashlib.sha256(token.encode()).hexdigest(), 16) % dimensions] += 1.0
        return vector

    def search(self, query: str, limit: int = 2) -> list[dict]:
        if self.collection is not None:
            try:
                result = self.collection.query(query_embeddings=[self._embedding(query)], n_results=limit, include=["documents", "distances"])
                return [
                    {"policy_id": result["ids"][0][i], "text": text, "distance": round(float(result["distances"][0][i]), 4)}
                    for i, text in enumerate(result["documents"][0])
                ]
            except Exception:
                pass
        query_tokens = _tokens(query)
        ranked = sorted(self.policies, key=lambda policy: len(query_tokens & _tokens(policy[1])), reverse=True)[:limit]
        return [{"policy_id": key, "text": text, "distance": None} for key, text in ranked]
