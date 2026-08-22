"""
WEWAKE — trains the ML coercion classifier.
Run once: python train_model.py
Produces: app/data/coercion_model.joblib
"""
import json
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import FeatureUnion
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

DATA = Path(__file__).parent / "app" / "data" / "training_data.json"
OUT = Path(__file__).parent / "app" / "data" / "coercion_model.joblib"


def main():
    rows = json.loads(DATA.read_text(encoding="utf-8"))
    texts = [r["text"] for r in rows]
    labels = [r["label"] for r in rows]  # 1 = coercive/scam, 0 = normal

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    # Word n-grams carry phrase meaning, but they fragment on Devanagari
    # and on romanized spelling variants ("bhejo"/"bhejho"/"bhej do").
    # Character n-grams are script-agnostic and absorb that variation, so
    # the two are combined rather than chosen between.
    pipe = Pipeline([
        ("tfidf", FeatureUnion([
            ("word", TfidfVectorizer(
                analyzer="word",
                ngram_range=(1, 2),  # unigrams + bigrams catch phrases
                sublinear_tf=True,
                min_df=1,
                lowercase=True,
            )),
            ("char", TfidfVectorizer(
                analyzer="char_wb",
                ngram_range=(2, 5),  # script-agnostic: works for Devanagari
                sublinear_tf=True,
                min_df=1,
                lowercase=True,
            )),
        ])),
        ("clf", LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            C=2.0,
        )),
    ])

    pipe.fit(X_train, y_train)
    print(classification_report(y_test, pipe.predict(X_test), digits=3))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipe, OUT)
    print(f"saved -> {OUT}")


if __name__ == "__main__":
    main()
