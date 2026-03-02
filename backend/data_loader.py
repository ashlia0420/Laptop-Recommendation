# ==============================================================
# backend/data_loader.py
# ==============================================================

from pathlib import Path
import pandas as pd

_DATA_PATH = Path(__file__).parent / "data" / "laptop_cleaned.csv"

REQUIRED_COLUMNS = [
    "model_name", "brand", "processor_name",
    "ram(GB)", "ssd(GB)", "Hard Disk(GB)",
    "Operating System", "graphics",
    "screen_size(inches)", "resolution (pixels)",
    "no_of_cores", "no_of_threads", "price",
]

NUMERIC_COLUMNS = [
    "price", "ram(GB)", "ssd(GB)", "Hard Disk(GB)",
    "no_of_cores", "no_of_threads", "screen_size(inches)",
]


def _clean_numeric(series: pd.Series) -> pd.Series:
    """
    Strips common formatting before numeric coercion:
      - currency symbols  (₹, $, £, €)
      - thousands commas  (1,00,000 → 100000)
      - whitespace
    Then converts to float. Non-parseable values become NaN.
    """
    cleaned = (
        series.astype(str)
              .str.strip()
              .str.replace(r"[₹$£€]", "", regex=True)   # currency symbols
              .str.replace(",", "", regex=False)          # thousands separators
              .str.replace(r"\s+", "", regex=True)        # any remaining spaces
    )
    return pd.to_numeric(cleaned, errors="coerce")


def load_laptops() -> pd.DataFrame:
    if not _DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {_DATA_PATH}\n"
            "Place laptop_cleaned.csv inside backend/data/"
        )

    df = pd.read_csv(_DATA_PATH)
    df.columns = df.columns.str.strip()

    # Validate columns
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(
            f"Missing required columns: {missing}\n"
            f"Found: {list(df.columns)}"
        )

    # Clean and coerce numeric columns
    for col in NUMERIC_COLUMNS:
        df[col] = _clean_numeric(df[col])

    # Drop only rows where price OR ram is unparseable
    before = len(df)
    df = df.dropna(subset=["price", "ram(GB)"])
    after = len(df)
    if before != after:
        print(f"[data_loader] Dropped {before - after} rows with missing price or RAM.")

    # Fill remaining numeric nulls with 0
    for col in ["ssd(GB)", "Hard Disk(GB)", "no_of_cores", "no_of_threads"]:
        df[col] = df[col].fillna(0)

    # Derived fields
    df["total_storage_GB"] = df["ssd(GB)"] + df["Hard Disk(GB)"]
    df["cpu_performance"]  = df["no_of_cores"] * df["no_of_threads"]

    df = df.reset_index(drop=True)
    print(f"[data_loader] Loaded {len(df)} laptops. Price range: "
          f"₹{df['price'].min():,.0f} – ₹{df['price'].max():,.0f}")
    return df