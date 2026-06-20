# =========================================
# AI-Driven E-Commerce LLM Feature Pipeline
# =========================================

import pandas as pd
import numpy as np
import os
from transformers import AutoTokenizer, AutoModel
from textblob import TextBlob
import torch
import joblib

# -------------------------------
# 1. Load Dataset
# -------------------------------
file_path = './Dataset/Womens Clothing E-Commerce Reviews.csv'
df = pd.read_csv(file_path)

# Fill missing text & convert numeric
df['Review Text'] = df['Review Text'].fillna('')
df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce')

print(f"Dataset loaded: {df.shape[0]} samples")

# -------------------------------
# 2. Load DeBERTaV3 Model
# -------------------------------
model_name = "microsoft/deberta-v3-small"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)
model.eval() 

# -------------------------------
# 3. Define Embedding + Sentiment Pipeline
# -------------------------------
def embedding_pipeline(texts):
 
    embeddings = []
    for text in texts:
        # LLM embedding
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            outputs = model(**inputs)
        embed = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
        
        # Sentiment features
        polarity = TextBlob(text).sentiment.polarity
        subjectivity = TextBlob(text).sentiment.subjectivity
        
        # Concatenate embeddings + sentiment
        combined = np.hstack((embed, [polarity, subjectivity]))
        embeddings.append(combined)
        
    return np.array(embeddings)

# -------------------------------
# 4. Generate Features (optional, for verification)
# -------------------------------
features = embedding_pipeline(df['Review Text'].tolist())
print("Feature matrix shape:", features.shape)

# -------------------------------
# 5. Save Model, Tokenizer & Pipeline
# -------------------------------
model_folder = './saved_model'
os.makedirs(model_folder, exist_ok=True)

# Save tokenizer and model
tokenizer.save_pretrained(model_folder)
model.save_pretrained(model_folder)

# Save pipeline function
joblib.dump(embedding_pipeline, os.path.join(model_folder, 'embedding_pipeline.pkl'))

print(f"LLM feature pipeline saved in folder: {model_folder}")