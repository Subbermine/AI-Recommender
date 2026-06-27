# =========================================
# Fine-tune DeBERTaV3 on E-Commerce Review JSONL Data
# =========================================

import os
from pathlib import Path
import pandas as pd
import numpy as np
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding,
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "Dataset"
SAVED_MODEL_DIR = BASE_DIR / "saved_model"
ELECTRONICS_FILE = DATA_DIR / "Electronics.jsonl"
FASHION_FILE = DATA_DIR / "Amazon_Fashion.jsonl"
MODEL_NAME = "microsoft/deberta-v3-small"
SEED = 42
MAX_SEQ_LENGTH = 192
TRAIN_BATCH_SIZE = 8
EVAL_BATCH_SIZE = 16
NUM_EPOCHS = 2
MAX_ELECTRONICS_SAMPLES = 50000
MAX_FASHION_SAMPLES = 30000


class ReviewDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {k: torch.tensor(v[idx]) for k, v in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx])
        return item


def load_jsonl_reviews(path: Path, sample_rate: float, target_samples: int) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found: {path}")

    frames = []
    for chunk in pd.read_json(path, lines=True, chunksize=200000):
        if "rating" not in chunk.columns:
            continue

        chunk = chunk[[col for col in ["title", "text", "rating"] if col in chunk.columns]].copy()
        chunk["rating"] = pd.to_numeric(chunk["rating"], errors="coerce")
        chunk = chunk[chunk["rating"].between(1.0, 5.0)]
        if chunk.empty:
            continue

        chunk["title"] = chunk.get("title", "").fillna("").astype(str)
        chunk["text"] = chunk.get("text", "").fillna("").astype(str)
        chunk["review_text"] = (
            chunk["title"].str.strip() + ". " + chunk["text"].str.strip()
        ).str.strip()
        chunk["review_text"] = chunk["review_text"].replace(r"^\.\s*", "", regex=True)

        sampled = chunk.sample(frac=sample_rate, random_state=SEED)
        frames.append(sampled)

        if sum(len(frame) for frame in frames) >= target_samples:
            break

    if not frames:
        raise ValueError(f"No valid records found in {path}")

    df = pd.concat(frames, ignore_index=True)
    df = df.dropna(subset=["review_text", "rating"])
    df = df[df["review_text"].str.len() > 0].reset_index(drop=True)

    if len(df) > target_samples:
        df = df.sample(n=target_samples, random_state=SEED).reset_index(drop=True)

    df["rating"] = df["rating"].round().astype(int).clip(1, 5)
    df["label"] = df["rating"] - 1
    return df[["review_text", "rating", "label"]]


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return {
        "accuracy": accuracy_score(labels, predictions),
        "f1_macro": f1_score(labels, predictions, average="macro"),
    }


def build_tokenized_dataset(tokenizer, texts, labels):
    encodings = tokenizer(
        texts,
        truncation=True,
        padding=True,
        max_length=MAX_SEQ_LENGTH,
    )
    return ReviewDataset(encodings, labels)


def main():
    print("Loading review datasets...")
    electronics = load_jsonl_reviews(ELECTRONICS_FILE, sample_rate=0.02, target_samples=MAX_ELECTRONICS_SAMPLES)
    fashion = load_jsonl_reviews(FASHION_FILE, sample_rate=0.08, target_samples=MAX_FASHION_SAMPLES)

    df = pd.concat([electronics, fashion], ignore_index=True).reset_index(drop=True)
    df = df.sample(frac=1.0, random_state=SEED).reset_index(drop=True)

    print(f"Combined dataset size: {len(df)} samples")
    print(df["rating"].value_counts().sort_index())

    train_texts, val_texts, train_labels, val_labels = train_test_split(
        df["review_text"].tolist(),
        df["label"].tolist(),
        test_size=0.1,
        stratify=df["label"].tolist(),
        random_state=SEED,
    )

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=5,
    )

    train_dataset = build_tokenized_dataset(tokenizer, train_texts, train_labels)
    val_dataset = build_tokenized_dataset(tokenizer, val_texts, val_labels)

    data_collator = DataCollatorWithPadding(tokenizer)
    training_args = TrainingArguments(
        output_dir=str(SAVED_MODEL_DIR),
        num_train_epochs=NUM_EPOCHS,
        per_device_train_batch_size=TRAIN_BATCH_SIZE,
        per_device_eval_batch_size=EVAL_BATCH_SIZE,
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=2e-5,
        logging_steps=100,
        save_total_limit=2,
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        seed=SEED,
        use_cpu=not torch.cuda.is_available(),
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )

    print("Starting fine-tuning...")
    trainer.train()

    print("Evaluating best model on validation set...")
    metrics = trainer.evaluate()
    for key, value in metrics.items():
        print(f"{key}: {value}")

    print(f"Saving fine-tuned model to {SAVED_MODEL_DIR}")
    os.makedirs(SAVED_MODEL_DIR, exist_ok=True)
    trainer.save_model(SAVED_MODEL_DIR)
    tokenizer.save_pretrained(SAVED_MODEL_DIR)

    print("Model training and saving complete.")


if __name__ == "__main__":
    main()
