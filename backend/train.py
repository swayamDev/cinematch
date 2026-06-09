"""
train.py — Offline preprocessing pipeline.

Run this once to generate the .pkl artefacts that main.py loads at startup.

Usage:
    python train.py --csv movies_metadata.csv --out .
"""

import argparse
import ast
import os
import pickle
import re
import warnings

import nltk
import numpy as np
import pandas as pd
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer

warnings.filterwarnings("ignore")


# ---------------------------------------------------------------------------
# NLP helpers
# ---------------------------------------------------------------------------

def _ensure_nltk():
    for resource in ("stopwords", "wordnet"):
        try:
            nltk.data.find(f"corpora/{resource}")
        except LookupError:
            nltk.download(resource, quiet=True)


_ensure_nltk()
_stop_words = set(stopwords.words("english"))
_lemmatizer = WordNetLemmatizer()


def preprocess(text: str) -> str:
    text = re.sub(r"[^a-zA-Z]", " ", text)
    text = text.lower()
    words = [
        _lemmatizer.lemmatize(w)
        for w in text.split()
        if w not in _stop_words
    ]
    return " ".join(words)


def parse_genres(raw: str) -> str:
    """Turn the JSON-like genres column into a space-separated string."""
    try:
        return " ".join(item["name"] for item in ast.literal_eval(raw))
    except Exception:
        return ""


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def build_artifacts(csv_path: str, out_dir: str) -> None:
    print(f"[train] Loading {csv_path} …")
    df = pd.read_csv(csv_path, low_memory=False)

    # --- feature selection ---------------------------------------------------
    df = df[["title", "overview", "genres", "tagline"]].copy()
    df = df.drop_duplicates(subset="title").reset_index(drop=True)

    # --- fill / parse --------------------------------------------------------
    df["overview"] = df["overview"].fillna("")
    df["tagline"] = df["tagline"].fillna("")
    df["genres"] = df["genres"].apply(parse_genres)

    # --- combine & preprocess ------------------------------------------------
    df["tags"] = (df["overview"] + " " + df["genres"] + " " + df["tagline"])
    df["tags"] = df["tags"].apply(preprocess)

    # --- TF-IDF --------------------------------------------------------------
    print("[train] Fitting TF-IDF vectoriser …")
    tfidf = TfidfVectorizer(
        max_features=50_000,
        ngram_range=(1, 2),
        stop_words="english",
    )
    tfidf_matrix = tfidf.fit_transform(df["tags"])
    print(f"[train] Matrix shape: {tfidf_matrix.shape}")

    # --- index: title → row number ------------------------------------------
    indices = pd.Series(df.index, index=df["title"]).drop_duplicates()

    # --- save artefacts ------------------------------------------------------
    os.makedirs(out_dir, exist_ok=True)

    def _dump(obj, name):
        path = os.path.join(out_dir, name)
        with open(path, "wb") as f:
            pickle.dump(obj, f)
        size_mb = os.path.getsize(path) / 1_048_576
        print(f"[train] Saved {name} ({size_mb:.1f} MB)")

    _dump(df[["title"]], "df.pkl")
    _dump(indices, "indices.pkl")
    _dump(tfidf_matrix, "tfidf_matrix.pkl")

    print("[train] Done.")


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build movie recommendation artefacts")
    parser.add_argument("--csv", default="movies_metadata.csv", help="Path to raw CSV")
    parser.add_argument("--out", default=".", help="Output directory for .pkl files")
    args = parser.parse_args()

    build_artifacts(args.csv, args.out)
