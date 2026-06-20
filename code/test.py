import os
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['HF_HUB_OFFLINE'] = '1'

import pandas as pd
import numpy as np
from transformers import AutoTokenizer, AutoModel
from textblob import TextBlob
import torch
import joblib

print("Starting test.py...")
# -------------------------------
# 1. Load Dataset
# -------------------------------
print("Loading dataset...")
file_path = './Dataset/Womens Clothing E-Commerce Reviews.csv'
df = pd.read_csv(file_path)

# Fill missing text & convert numeric
df['Review Text'] = df['Review Text'].fillna('')
df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce')
df['Positive Feedback Count'] = pd.to_numeric(df['Positive Feedback Count'], errors='coerce')
df['Recommended IND'] = pd.to_numeric(df['Recommended IND'], errors='coerce')

# -------------------------------
# 2. Load DeBERTaV3 Model
# -------------------------------
model_name = "./saved_model"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)
model.eval()

# -------------------------------
# 3. Define Embedding + Sentiment Pipeline
# -------------------------------
def embedding_pipeline(texts):
    embeddings = []
    for text in texts:
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            outputs = model(**inputs)
        embed = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
        polarity = TextBlob(text).sentiment.polarity
        subjectivity = TextBlob(text).sentiment.subjectivity
        combined = np.hstack((embed, [polarity, subjectivity]))
        embeddings.append(combined)
    return np.array(embeddings)

# -------------------------------
# 4. Generate Features for First 10 Users
# -------------------------------

first_10 = df.head(10).copy()
features_10 = embedding_pipeline(first_10['Review Text'].tolist())

first_10_features = pd.DataFrame(features_10)
first_10_combined = pd.concat([first_10.reset_index(drop=True), first_10_features], axis=1)


os.makedirs('./output', exist_ok=True)
csv_path = './output/first_10_users_features.csv'
first_10_combined.to_csv(csv_path, index=False)
print(f"CSV saved: {csv_path}")

# -------------------------------
# 5. Compute Weightage
# -------------------------------

first_10_combined['Weightage'] = first_10_combined['Rating'] * np.log1p(first_10_combined['Positive Feedback Count'])
print(first_10_combined[['Clothing ID', 'Rating', 'Positive Feedback Count', 'Weightage']])

# -------------------------------
# 6. Ranking Top Recommended Products
# -------------------------------

first_10_combined['Rank'] = first_10_combined['Weightage'].rank(ascending=False, method='dense')
ranked_csv_path = './output/first_10_users_ranking.csv'
first_10_combined.sort_values('Rank', inplace=True)
first_10_combined.to_csv(ranked_csv_path, index=False)
print(f"Top recommended products ranking CSV saved: {ranked_csv_path}")

print(first_10_combined[['Clothing ID', 'Weightage', 'Rank']])


#Amz

import pandas as pd
import numpy as np
import os
from transformers import AutoTokenizer, AutoModel
from textblob import TextBlob
import torch

# -------------------------------
# 1. Load Dataset
# -------------------------------
file_path = './Dataset/Amazon.csv'
df = pd.read_csv(file_path)

# Rename columns for consistency (optional but cleaner)
df.rename(columns={
    'reviews.text': 'Review Text',
    'reviews.rating': 'Rating',
    'reviews.numHelpful': 'Positive Feedback Count',
    'reviews.doRecommend': 'Recommended IND',
    'asins': 'Product ID'
}, inplace=True)

# Fill missing values
df['Review Text'] = df['Review Text'].fillna('')
df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce')
df['Positive Feedback Count'] = pd.to_numeric(df['Positive Feedback Count'], errors='coerce')

# -------------------------------
# 2. Load DeBERTaV3 Model
# -------------------------------
model_name = "./saved_model"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)
model.eval()

# -------------------------------
# 3. Embedding + Sentiment Pipeline
# -------------------------------
def embedding_pipeline(texts):
    embeddings = []
    for text in texts:
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            outputs = model(**inputs)

        embed = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

        sentiment = TextBlob(text)
        polarity = sentiment.polarity
        subjectivity = sentiment.subjectivity

        combined = np.hstack((embed, [polarity, subjectivity]))
        embeddings.append(combined)

    return np.array(embeddings)

# -------------------------------
# 4. Generate Features for First 10 Reviews
# -------------------------------
first_10 = df.head(10).copy()
features_10 = embedding_pipeline(first_10['Review Text'].tolist())

features_df = pd.DataFrame(features_10)
combined_df = pd.concat([first_10.reset_index(drop=True), features_df], axis=1)

os.makedirs('./output', exist_ok=True)
csv_path = './output/amazon_first_10_features.csv'
combined_df.to_csv(csv_path, index=False)

print(f"CSV saved: {csv_path}")

# -------------------------------
# 5. Compute Weightage
# -------------------------------
combined_df['Weightage'] = combined_df['Rating'] * np.log1p(
    combined_df['Positive Feedback Count'].fillna(0)
)

print(combined_df[['Product ID', 'Rating', 'Positive Feedback Count', 'Weightage']])

# -------------------------------
# 6. Ranking Top Recommended Products
# -------------------------------
combined_df['Rank'] = combined_df['Weightage'].rank(ascending=False, method='dense')

ranked_csv_path = './output/amazon_first_10_ranking.csv'
combined_df.sort_values('Rank', inplace=True)
combined_df.to_csv(ranked_csv_path, index=False)

print(f"Ranking CSV saved: {ranked_csv_path}")
print(combined_df[['Product ID', 'Weightage', 'Rank']])

#flp
import pandas as pd
import numpy as np
import os
from transformers import AutoTokenizer, AutoModel
from textblob import TextBlob
import torch
import re

# -------------------------------
# 1. Load Dataset
# -------------------------------
file_path = './Dataset/Flipkart.csv'
df = pd.read_csv(file_path)

# Rename columns based on NEW dataset
df.rename(columns={
    'product_name': 'Product Name',
    'Rate': 'Rating',
    'Review': 'Review Text',
    'Summary': 'Summary',
    'Sentiment': 'Sentiment',
    'product_price': 'Price'
}, inplace=True)

# -------------------------------
# 2. Data Cleaning
# -------------------------------
# Remove weird characters from product names
df['Product Name'] = df['Product Name'].astype(str).apply(
    lambda x: re.sub(r'[^a-zA-Z0-9\s]', '', x)
)

# Handle missing values
df['Review Text'] = df['Review Text'].fillna('')
df['Summary'] = df['Summary'].fillna('')
df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce').fillna(0)

# Combine Review + Summary (better context)
df['Full Review'] = df['Review Text'] + " " + df['Summary']

# -------------------------------
# 3. Shuffle + Select 10 UNIQUE Products
# -------------------------------
df = df.sample(frac=1, random_state=42)

unique_products = df['Product Name'].dropna().unique()

# Ensure at least 10 unique products
if len(unique_products) >= 10:
    selected_products = unique_products[:10]
else:
    selected_products = unique_products

filtered_df = df[df['Product Name'].isin(selected_products)].copy()

# -------------------------------
# 4. Load DeBERTa Model
# -------------------------------
model_name = "./saved_model"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)
model.eval()

# -------------------------------
# 5. Embedding + Sentiment Pipeline
# -------------------------------
def embedding_pipeline(texts):
    embeddings = []
    polarities = []

    for text in texts:
        text = str(text)[:512]

        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=128
        )

        with torch.no_grad():
            outputs = model(**inputs)

        embed = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

        # Sentiment (TextBlob)
        sentiment = TextBlob(text)
        polarity = sentiment.polarity
        subjectivity = sentiment.subjectivity

        combined = np.hstack((embed, [polarity, subjectivity]))

        embeddings.append(combined)
        polarities.append(polarity)

    return np.array(embeddings), polarities

# Apply pipeline
features, polarities = embedding_pipeline(filtered_df['Full Review'].tolist())

# -------------------------------
# 6. Combine Data
# -------------------------------
features_df = pd.DataFrame(features)
combined_df = pd.concat([filtered_df.reset_index(drop=True), features_df], axis=1)

combined_df['Polarity'] = polarities

# Save feature file
os.makedirs('./output', exist_ok=True)
combined_df.to_csv('./output/flipkart_features.csv', index=False)

# -------------------------------
# 7. Aggregate (UNIQUE PRODUCTS)
# -------------------------------
product_df = combined_df.groupby('Product Name').agg({
    'Rating': 'mean',
    'Polarity': 'mean',
    'Full Review': 'count'
}).rename(columns={'Full Review': 'Review Count'}).reset_index()

# -------------------------------
# 8. Compute Weightage
# -------------------------------
product_df['Weightage'] = (
    0.6 * product_df['Rating'] +
    0.3 * product_df['Polarity'] +
    0.1 * np.log1p(product_df['Review Count'])
)

# -------------------------------
# 9. Sort + Top 10 UNIQUE PRODUCTS
# -------------------------------
product_df = product_df.sort_values(
    ['Weightage', 'Review Count'],
    ascending=[False, False]
)

top_10_products = product_df.head(min(10, len(product_df))).copy()

# Ranking
top_10_products['Rank'] = range(1, len(top_10_products) + 1)

# -------------------------------
# 10. Save Output
# -------------------------------
output_path = './output/flipkart_top10_unique_products.csv'
top_10_products.to_csv(output_path, index=False)

print("\nTop 10 UNIQUE Products:\n")
print(top_10_products[['Product Name', 'Rating', 'Polarity', 'Review Count', 'Weightage', 'Rank']])
print(f"\nSaved at: {output_path}")

#amz
import pandas as pd
import numpy as np
import os
from transformers import AutoTokenizer, AutoModel
from textblob import TextBlob
import torch

# -------------------------------
# 1. Load Dataset
# -------------------------------
file_path = './Dataset/Flipkart.csv'
df = pd.read_csv(file_path)

# Rename columns for consistency
df.rename(columns={
    'Review': 'Review Text',
    'Rate': 'Rating',
    'product_name': 'Product Name'
}, inplace=True)

# Handle missing values
df['Review Text'] = df['Review Text'].fillna('')
df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce')

# -------------------------------
# 2. Shuffle + Select 10 UNIQUE Products
# -------------------------------
df = df.sample(frac=1, random_state=42)  # shuffle dataset

unique_products = df['Product Name'].dropna().unique()[:10]

# Filter all reviews belonging to those 10 products
filtered_df = df[df['Product Name'].isin(unique_products)].copy()

# -------------------------------
# 3. Load DeBERTa Model
# -------------------------------
model_name = "./saved_model"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)
model.eval()

# -------------------------------
# 4. Embedding + Sentiment Pipeline
# -------------------------------
def embedding_pipeline(texts):
    embeddings = []
    polarities = []

    for text in texts:
        text = str(text)[:512]  # truncate long reviews

        inputs = tokenizer(text, return_tensors="pt",
                           truncation=True, padding=True, max_length=128)

        with torch.no_grad():
            outputs = model(**inputs)

        embed = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

        sentiment = TextBlob(text)
        polarity = sentiment.polarity
        subjectivity = sentiment.subjectivity

        combined = np.hstack((embed, [polarity, subjectivity]))

        embeddings.append(combined)
        polarities.append(polarity)

    return np.array(embeddings), polarities

# Apply pipeline
features, polarities = embedding_pipeline(filtered_df['Review Text'].tolist())

# Combine data
features_df = pd.DataFrame(features)
combined_df = pd.concat([filtered_df.reset_index(drop=True), features_df], axis=1)

# Add polarity column
combined_df['Polarity'] = polarities

# Save feature file
os.makedirs('./output', exist_ok=True)
combined_df.to_csv('./output/flipkart_features.csv', index=False)

# -------------------------------
# 5. Aggregate (REMOVE DUPLICATES)
# -------------------------------
product_df = combined_df.groupby('Product Name').agg({
    'Rating': 'mean',
    'Polarity': 'mean',
    'Review Text': 'count'
}).rename(columns={'Review Text': 'Review Count'}).reset_index()

# -------------------------------
# 6. Compute Weightage
# -------------------------------
product_df['Weightage'] = (
    0.6 * product_df['Rating'] +
    0.3 * product_df['Polarity'] +
    0.1 * np.log1p(product_df['Review Count'])
)

# -------------------------------
# 7. Sort + Select TOP 10 UNIQUE PRODUCTS
# -------------------------------
product_df = product_df.sort_values(
    ['Weightage', 'Review Count'],
    ascending=[False, False]
)

top_10_products = product_df.head(min(10, len(product_df))).copy()

# Re-rank 1 to 10
top_10_products['Rank'] = range(1, len(top_10_products) + 1)

# -------------------------------
# 8. Save Final Output
# -------------------------------
output_path = './output/flipkart_top10_unique_products.csv'
top_10_products.to_csv(output_path, index=False)

print(f"\nTop 10 unique products saved at: {output_path}\n")
print(top_10_products[['Product Name', 'Rating', 'Polarity', 'Review Count', 'Weightage', 'Rank']])
exec(open('perf.py').read())