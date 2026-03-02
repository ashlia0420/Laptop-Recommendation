# ==============================================================
# backend/app.py
# ==============================================================
# Run:  cd backend && uvicorn app:app --reload
# ==============================================================

from contextlib import asynccontextmanager
from typing import Any

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from data_loader import load_laptops
from decision_engine import run_pipeline

_df: pd.DataFrame | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _df
    try:
        _df = load_laptops()
        print(f"[LareC] Dataset ready — {len(_df)} laptops loaded.")
    except Exception as exc:
        _df = None
        print(f"[LareC] WARNING: Dataset failed to load — {exc}")
    yield


app = FastAPI(
    title="LareC — Laptop Recommender API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class RecommendRequest(BaseModel):
    hard_constraints: dict[str, Any] = Field(default={})
    soft_preferences: dict[str, int] = Field(default={})


# ── Health ─────────────────────────────────────────────────────

@app.get("/")
def health():
    return {
        "status": "ok",
        "dataset_loaded": _df is not None,
        "laptops_available": len(_df) if _df is not None else 0,
    }


# ── Debug — remove before production ──────────────────────────

@app.get("/debug")
def debug():
    """
    Returns a snapshot of the loaded dataset so you can verify
    that prices, RAM, and storage parsed correctly.
    Shows first 5 rows + price/RAM stats.
    """
    if _df is None:
        return {"error": "Dataset not loaded"}

    sample = _df[["brand", "model_name", "price", "ram(GB)",
                   "ssd(GB)", "Hard Disk(GB)", "total_storage_GB",
                   "Operating System"]].head(10).to_dict(orient="records")

    return {
        "total_rows": len(_df),
        "price_min":  float(_df["price"].min()),
        "price_max":  float(_df["price"].max()),
        "ram_values": sorted(_df["ram(GB)"].unique().tolist()),
        "os_values":  _df["Operating System"].dropna().unique().tolist()[:10],
        "sample":     sample,
    }


# ── Recommend ──────────────────────────────────────────────────

@app.post("/api/recommend")
def recommend(request: RecommendRequest):
    if _df is None or _df.empty:
        raise HTTPException(status_code=503, detail="Dataset not available.")

    budget = request.hard_constraints.get("budget")
    if not budget or float(budget) <= 0:
        raise HTTPException(status_code=422, detail="A valid budget is required.")

    # Log the incoming payload so issues are visible in the terminal
    print(f"[LareC] Request — hard: {request.hard_constraints} | soft: {request.soft_preferences}")

    try:
        results = run_pipeline(
            df=_df.copy(),
            hard_constraints=request.hard_constraints,
            soft_preferences=request.soft_preferences,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {exc}")

    print(f"[LareC] Returning {len(results)} results.")
    return {"results": results}