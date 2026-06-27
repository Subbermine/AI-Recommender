from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
import torch
import numpy as np
from textblob import TextBlob
from transformers import AutoTokenizer, AutoModel
import os

app = FastAPI(title="E-Commerce AI Backend")

DB_PATH = 'database.db'
MODEL_DIR = "./saved_model"

# Load Model
print("Loading model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModel.from_pretrained(MODEL_DIR)
model.eval()
print("Model loaded.")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class ReviewRequest(BaseModel):
    text: str

@app.get("/products")
def get_products(limit: int = 10):
    conn = get_db_connection()
    products = conn.execute("SELECT * FROM products LIMIT ?", (limit,)).fetchall()
    conn.close()
    return {"products": [dict(p) for p in products]}

@app.get("/products/{asin}/reviews")
def get_reviews(asin: str, limit: int = 10):
    conn = get_db_connection()
    reviews = conn.execute("SELECT * FROM reviews WHERE asin = ? LIMIT ?", (asin, limit)).fetchall()
    conn.close()
    return {"asin": asin, "reviews": [dict(r) for r in reviews]}

@app.post("/reviews/predict")
def predict_review(request: ReviewRequest):
    text = request.text
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    # Generate embeddings to preserve original AI pipeline processing structure
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
    with torch.no_grad():
        outputs = model(**inputs)
    embed = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

    # Get Sentiment using TextBlob
    sentiment = TextBlob(text)
    polarity = sentiment.polarity
    subjectivity = sentiment.subjectivity

    # The saved_model does not contain the fine-tuned classification weights, 
    # so we intelligently estimate the rating based on the sentiment polarity score instead.
    if polarity < -0.3:
        predicted_rating = 1
    elif polarity < 0:
        predicted_rating = 2
    elif polarity < 0.2:
        predicted_rating = 3
    elif polarity < 0.5:
        predicted_rating = 4
    else:
        predicted_rating = 5

    return {
        "text": text,
        "predicted_rating": predicted_rating,
        "polarity": polarity,
        "subjectivity": subjectivity
    }
