# ==============================================================
# backend/decision_engine.py
# ==============================================================
# The full decision pipeline — every computational step lives here.
#
# Pipeline:
#   1. Hard constraint filtering  (pass / fail)
#   2. Min-max normalization      (per active soft field)
#   3. Weighted score computation (sum of normalized × weight)
#   4. Ranking                    (descending sort, top 5)
#   5. Explanation generation     (deterministic, rule-based)
#
# Rules:
#   - No AI, no randomness
#   - No CSV loading (data_loader.py handles that)
#   - No FastAPI concerns (app.py handles that)
# ==============================================================

from __future__ import annotations
from typing import Any
import pandas as pd

# ── Configuration ──────────────────────────────────────────────

TOP_N = 5

RANK_LABELS = {
    1: "Best match",
    2: "Strong match",
    3: "Good match",
    4: "Decent match",
    5: "Possible match",
}

# Human-readable labels for each soft-preference field
FIELD_LABELS: dict[str, str] = {
    "cpu_performance":     "Processing performance",
    "ram(GB)":             "RAM",
    "total_storage_GB":    "Total storage",
    "ssd(GB)":             "SSD storage",
    "screen_size(inches)": "Display size",
}


# ── Public entry point ─────────────────────────────────────────

def run_pipeline(
    df: pd.DataFrame,
    hard_constraints: dict[str, Any],
    soft_preferences: dict[str, int],
) -> list[dict]:
    """
    Run the full recommendation pipeline on a laptop DataFrame.

    Args:
        df               : Full dataset from data_loader.load_laptops()
        hard_constraints : {"budget": 80000, "os": "Windows",
                            "min_ram": 8, "min_storage": 256}
        soft_preferences : {"cpu_performance": 3, "ram(GB)": 2, ...}
                           Weight values: 3 = High, 2 = Medium, 1 = Low

    Returns:
        List of up to TOP_N result dicts sorted by score descending.
        Each dict matches the /api/recommend response schema.
    """
    # 1. Filter
    filtered = _apply_hard_constraints(df, hard_constraints)
    if filtered.empty:
        return []

    # 2. Normalize
    filtered = _normalize(filtered, soft_preferences)

    # 3. Score
    filtered = _score(filtered, soft_preferences)

    # 4. Rank
    ranked = (
        filtered
        .sort_values("_score", ascending=False)
        .head(TOP_N)
        .reset_index(drop=True)
    )

    # 5. Build result objects
    results = []
    for position, row in ranked.iterrows():
        rank      = int(position) + 1
        score     = round(float(row["_score"]), 1)
        breakdown = _build_breakdown(row, soft_preferences)

        results.append({
            "rank":             rank,
            "rank_label":       RANK_LABELS.get(rank, f"Match #{rank}"),
            "brand":            _str(row.get("brand")),
            "model":            _str(row.get("model_name")),
            "price":            _float(row.get("price")),
            "os":               _str(row.get("Operating System")),
            "processor":        _str(row.get("processor_name")),
            "ram_gb":           _float(row.get("ram(GB)")),
            "ssd_gb":           _float(row.get("ssd(GB)")),
            "hdd_gb":           _float(row.get("Hard Disk(GB)")),
            "total_storage_gb": _float(row.get("total_storage_GB")),
            "screen_size":      _float(row.get("screen_size(inches)")),
            "score":            score,
            "explanation":      _explanation(row, rank, score, breakdown),
            "strengths":        _strengths(breakdown),
            "tradeoffs":        _tradeoffs(breakdown, soft_preferences),
            "feature_breakdown": breakdown,
        })

    return results


# ── Step 1: Hard Constraint Filtering ─────────────────────────

def _apply_hard_constraints(
    df: pd.DataFrame,
    c: dict[str, Any],
) -> pd.DataFrame:
    """Return only laptops that satisfy all hard constraints."""
    mask = pd.Series(True, index=df.index)

    # Budget
    budget = _num(c.get("budget"))
    if budget and budget > 0:
        mask &= df["price"] <= budget

    # Operating System (partial, case-insensitive match)
    os_pref = _str(c.get("os", "any")).lower()
    if os_pref and os_pref not in ("any", ""):
        mask &= df["Operating System"].str.lower().str.contains(os_pref, na=False)

    # Minimum RAM
    min_ram = _num(c.get("min_ram", 0))
    if min_ram and min_ram > 0:
        mask &= df["ram(GB)"] >= min_ram

    # Minimum total storage
    min_storage = _num(c.get("min_storage", 0))
    if min_storage and min_storage > 0:
        mask &= df["total_storage_GB"] >= min_storage

    return df[mask].copy()


# ── Step 2: Min-Max Normalization ──────────────────────────────

def _normalize(
    df: pd.DataFrame,
    weights: dict[str, int],
) -> pd.DataFrame:
    """
    Add a _norm_{field} column for each active soft field.
    Values are scaled to [0.0, 1.0] using min-max across the
    filtered pool. Fields with zero variance are set to 0.
    """
    df = df.copy()
    for field, w in weights.items():
        if w <= 0 or field not in df.columns:
            continue                            #here all the unnecessary fields are skipped, ie, This prevents:Fields with weight 0, Invalid column names, Mistakes from frontend. Therefore only active, valid features are normalized.
        col_min = df[field].min()
        col_max = df[field].max()
        rng     = col_max - col_min   #range
        if rng == 0:
            df[f"_norm_{field}"] = 0.0
        else:
            df[f"_norm_{field}"] = ((df[field] - col_min) / rng).clip(0.0, 1.0)
    return df


# ── Step 3: Weighted Score ─────────────────────────────────────

def _score(
    df: pd.DataFrame,
    weights: dict[str, int],
) -> pd.DataFrame:
    """
    Compute final score [0, 100] per laptop.
    Formula: Σ(norm_i × w_i) / Σ(w_i) × 100
    """
    df         = df.copy()
    active     = {f: w for f, w in weights.items() if w > 0}
    total_w    = sum(active.values())

    if not active or total_w == 0:
        # No soft preferences set — rank by price ascending (cheapest first)
        # Invert so cheapest gets the highest score (~100), most expensive gets ~0
        price_min = df["price"].min()
        price_max = df["price"].max()
        price_range = price_max - price_min
        if price_range > 0:
            df["_score"] = ((1 - (df["price"] - price_min) / price_range) * 100).round(1)
        else:
            df["_score"] = 50.0
        return df

    

    score_series = pd.Series(0.0, index=df.index)
    for field, w in active.items():
        norm_col = f"_norm_{field}"
        if norm_col in df.columns:
            score_series += df[norm_col] * w

    df["_score"] = ((score_series / total_w) * 100).round(1)
    return df


# ── Step 5: Explanation Builders ───────────────────────────────

def _build_breakdown(
    row: pd.Series,
    weights: dict[str, int],
) -> dict[str, dict]:
    """
    Per-field contribution breakdown for one laptop.
    contribution = (normalized × weight / total_weight) × 100
    """
    active   = {f: w for f, w in weights.items() if w > 0}
    total_w  = sum(active.values())
    result   = {}

    for field, w in active.items():
        norm_key     = f"_norm_{field}"
        raw          = _float(row.get(field, 0))
        normalized   = _float(row.get(norm_key, 0))
        contribution = round((normalized * w / total_w) * 100, 1) if total_w > 0 else 0.0

        result[field] = {
            "label":        FIELD_LABELS.get(field, field),
            "raw_value":    raw,
            "normalized":   round(normalized, 4),
            "weight":       w,
            "contribution": contribution,
        }

    return result

# ── Benefit-focused explanation patterns ──────────────────────
#
# Maps each scored field to three tiers of human-readable benefit
# descriptions. Explanations describe what the laptop does for the
# user — never raw scores, never internal metrics.
#
# Structure per field:
#   "low"    — benefit phrase when value is in the low tier
#   "mid"    — benefit phrase when value is in the mid tier
#   "high"   — benefit phrase when value is in the high tier
#   "metric" — lambda: human-friendly value string shown in strengths
#   "tiers"  — list of (min, max, tier_name) used to classify value

_BENEFIT_PATTERNS: dict[str, dict] = {
    # All phrase values must be verb-led so that the template
    # "this laptop {phrase}" always reads as a grammatical sentence.
    "cpu_performance": {
        "low":    "handles everyday tasks like browsing and documents",
        "mid":    "runs office apps, video calls, and light multitasking comfortably",
        "high":   "handles demanding workloads and heavy multitasking with ease",
        "metric": lambda v: f"a {int(v)}-point CPU score",
        "tiers":  [(0, 30, "low"), (30, 80, "mid"), (80, 9999, "high")],
    },
    "ram(GB)": {
        "low":    "covers basic use with a few browser tabs open",
        "mid":    "handles multitasking across several apps at once without slowdowns",
        "high":   "runs many applications simultaneously with plenty of headroom",
        "metric": lambda v: f"{int(v)} GB RAM",
        "tiers":  [(0, 8, "low"), (8, 16, "mid"), (16, 9999, "high")],
    },
    "total_storage_GB": {
        "low":    "offers enough space for essential files and installed apps",
        "mid":    "provides plenty of room for documents, photos, and a full software library",
        "high":   "delivers generous storage for large media libraries, projects, and backups",
        "metric": lambda v: f"{int(v)} GB total storage",
        "tiers":  [(0, 256, "low"), (256, 512, "mid"), (512, 9999, "high")],
    },
    "ssd(GB)": {
        "low":    "stays responsive for everyday tasks thanks to its SSD",
        "mid":    "boots quickly and launches apps without noticeable delays",
        "high":   "delivers excellent system speed with fast, large SSD storage",
        "metric": lambda v: f"{int(v)} GB SSD",
        "tiers":  [(0, 128, "low"), (128, 512, "mid"), (512, 9999, "high")],
    },
    "screen_size(inches)": {
        "low":    "stays compact and portable for on-the-go use",
        "mid":    "strikes a good balance between screen space and portability",
        "high":   "offers a large display suited to extended work or media sessions",
        "metric": lambda v: f'{v:.1f}" display',
        "tiers":  [(0, 13.9, "low"), (13.9, 15.5, "mid"), (15.5, 99, "high")],
    },
}


def _benefit_tier(field: str, value: float) -> str:
    """Return 'low', 'mid', or 'high' tier for a field value."""
    pattern = _BENEFIT_PATTERNS.get(field)
    if not pattern:
        return "mid"
    for lo, hi, tier in pattern["tiers"]:
        if lo <= value < hi:
            return tier
    return "high"


def _benefit_phrase(field: str, value: float) -> str | None:
    """Return the human-friendly benefit description for a field value."""
    pattern = _BENEFIT_PATTERNS.get(field)
    if not pattern:
        return None
    tier = _benefit_tier(field, value)
    return pattern[tier]


def _benefit_metric(field: str, value: float) -> str:
    """Return a human-friendly value string (e.g. '16 GB RAM')."""
    pattern = _BENEFIT_PATTERNS.get(field)
    if not pattern:
        return _fmt(field, value)
    return pattern["metric"](value)


def _explanation(
    row: pd.Series,
    rank: int,
    score: float,
    breakdown: dict,
) -> str:
    """
    Benefit-focused one-sentence summary.
    Does not mention scores or internal mechanics.
    """
    model = _str(row.get("model_name")).strip()
    price = _float(row.get("price"))
    if not breakdown:    # No soft preferences — price-sorted fallback
       if rank == 1:
        return (
            f"{model} meets all your requirements and offers the best value "
            f"within your budget at ₹{price:,.0f}."
        )
       elif rank == 2:
        return (
            f"{model} also meets your requirements and is a strong alternative "
            f"priced at ₹{price:,.0f}."
        )
       else:
        return (
            f"{model} fits your criteria and is available at ₹{price:,.0f}, "
            f"making it another option to consider."
        )

    # Find the field the user cares about most that this laptop does well on
    top_field = max(breakdown, key=lambda f: breakdown[f]["contribution"])
    top_value = breakdown[top_field]["raw_value"]
    top_phrase = _benefit_phrase(top_field, top_value)

    if rank == 1:
        if top_phrase:
            return (
                f"The {model} is your best match — "
                f"it {top_phrase}, which aligns closely with your priorities."
            )
        return f"The {model} is your best match across all your stated priorities."

    # Non-rank-1: acknowledge it's a step down but still worth considering
    if top_phrase:
        return (
            f"The {model} is a strong option that {top_phrase}, "
            f"though it may not lead on every priority."
        )
    return (
        f"The {model} meets your requirements and scores well "
        f"on several of your stated priorities."
    )


def _strengths(breakdown: dict) -> list[str]:
    """
    Up to 3 benefit-focused bullet points for the highest-contributing fields.
    Each sentence tells the user what the laptop can DO, not its score.
    """
    sentences = []
    top3 = sorted(
        breakdown.items(),
        key=lambda x: x[1]["contribution"],
        reverse=True,
    )[:3]

    for field, data in top3:
        if data["contribution"] <= 0:
            continue
        value  = data["raw_value"]
        phrase = _benefit_phrase(field, value)
        metric = _benefit_metric(field, value)

        if phrase:
            if (field == 'cpu_performance'):
                sentences.append(f"This laptop {phrase}.")
            else:
                sentences.append(f"With {metric}, this laptop {phrase}.")
        else:
            sentences.append(f"{data['label']}: {metric}.")

    return sentences


def _tradeoffs(breakdown: dict, weights: dict[str, int]) -> list[str]:
    """
    Plain-language warnings for fields the user rated important
    but where this laptop falls short — framed as practical advice,
    not as score comparisons.
    """
    warnings = []
    for field, data in breakdown.items():
        if weights.get(field, 0) >= 2 and data["normalized"] < 0.4:
            value  = data["raw_value"]
            metric = _benefit_metric(field, value)

            # Field-specific practical advice
            advice = {
                "cpu_performance":     "may feel slow for demanding tasks or heavy multitasking",
                "ram(GB)":             "may struggle when running several apps at the same time",
                "total_storage_GB":    "may fill up quickly if you store large files or many apps",
                "ssd(GB)":             "may result in slower boot times and app load speeds",
                "screen_size(inches)": "may feel cramped for extended work sessions",
            }.get(field, "may not fully meet your expectations for this feature")

            warnings.append(
                f"Heads up: with only {metric}, this laptop {advice}."
            )

    return warnings


# def _explanation(
#     row: pd.Series,
#     rank: int,
#     score: float,
#     breakdown: dict,
# ) -> str:
#     """One-sentence plain-English summary. Deterministic, rule-based."""
#     name = f"{_str(row.get('brand'))} {_str(row.get('model_name'))}".strip()

#     if not breakdown:
#         return f"{name} passed all your hard constraints and appears in results."

#     top_field = max(breakdown, key=lambda f: breakdown[f]["contribution"])
#     top_label = breakdown[top_field]["label"]

#     if rank == 1:
#         return (
#             f"{name} is your top match ({score}/100) — "
#             f"it leads especially on {top_label}."
#         )
#     return (
#         f"{name} earned a {_score_word(score)} score of {score}/100, "
#         f"with its strongest contribution from {top_label}."
#     )


# def _strengths(breakdown: dict) -> list[str]:
#     """Up to 3 sentences about the highest-contributing features."""
#     sentences = []
#     top3 = sorted(breakdown.items(), key=lambda x: x[1]["contribution"], reverse=True)[:3]
#     for field, data in top3:
#         if data["contribution"] <= 0:
#             continue
#         tier = _tier(data["contribution"])
#         fmt  = _fmt(field, data["raw_value"])
#         sentences.append(
#             f"{data['label']} {tier} contributes to this score — it has {fmt}."
#         )
#     return sentences


# def _tradeoffs(breakdown: dict, weights: dict[str, int]) -> list[str]:
#     """Warning for features the user rated important but this laptop scores low on."""
#     warnings = []
#     for field, data in breakdown.items():
#         if weights.get(field, 0) >= 2 and data["normalized"] < 0.4:
#             fmt = _fmt(field, data["raw_value"])
#             warnings.append(
#                 f"Note: {data['label']} is important to you, but this laptop "
#                 f"only has {fmt}, which is below average."
#             )
#     return warnings


# ── Private helpers ────────────────────────────────────────────

def _score_word(s: float) -> str:
    if s >= 80: return "excellent"
    if s >= 65: return "strong"
    if s >= 50: return "decent"
    if s >= 35: return "moderate"
    return "low"


def _tier(contribution: float) -> str:
    if contribution >= 25: return "strongly"
    if contribution >= 12: return "notably"
    if contribution >= 5:  return "moderately"
    return "slightly"


def _fmt(field: str, value: float) -> str:
    v = value if value is not None else 0
    formats = {
        "price":               f"₹{v:,.0f}",
        "ram(GB)":             f"{v:.0f} GB",
        "ssd(GB)":             f"{v:.0f} GB",
        "Hard Disk(GB)":       f"{v:.0f} GB",
        "total_storage_GB":    f"{v:.0f} GB",
        "screen_size(inches)": f'{v:.1f}"',
        "cpu_performance":     f"{v:.0f} (cores × threads)",
    }
    return formats.get(field, str(v))


def _num(val: Any) -> float | None:
    try:
        return float(val)
    except (TypeError, ValueError):
        return None


def _float(val: Any) -> float:
    try:
        return float(val) if val is not None else 0.0
    except (TypeError, ValueError):
        return 0.0


def _str(val: Any) -> str:
    return str(val).strip() if val is not None else ""