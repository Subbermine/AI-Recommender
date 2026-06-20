# Import necessary libraries
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load dataset
file_path = './Dataset/Amazon.csv'
df = pd.read_csv(file_path)

# Display basic info
print(df.info())
print(df.head())

# -------------------------------
# Data Cleaning (if needed)
# -------------------------------
# Fill missing 'reviews.text' with empty string
df['reviews.text'] = df['reviews.text'].fillna('')

# Convert 'reviews.rating' to numeric if not already
df['reviews.rating'] = pd.to_numeric(df['reviews.rating'], errors='coerce')

# -------------------------------
# Visualization
# -------------------------------
# 1. Distribution of Ratings
plt.figure(figsize=(6,4))
sns.countplot(x='reviews.rating', data=df, palette='viridis')
plt.title('Distribution of Ratings')
plt.savefig('./graph/1.png', dpi=600, bbox_inches='tight')

# 2. Average Rating per Brand
plt.figure(figsize=(7,4))
avg_rating_brand = df.groupby('brand')['reviews.rating'].mean().sort_values()
sns.barplot(x=avg_rating_brand.index, y=avg_rating_brand.values, palette='coolwarm')
plt.xticks(rotation=45)
plt.title('Average Rating per Brand')
plt.ylabel('Average Rating')
plt.savefig('./graph/2.png', dpi=600, bbox_inches='tight')

# 3. Helpful Votes vs Rating
plt.figure(figsize=(7,4))
sns.scatterplot(x='reviews.rating', y='reviews.numHelpful', data=df, hue='brand', palette='Set2')
plt.title('Helpful Votes vs Rating')
plt.savefig('./graph/3.png', dpi=600, bbox_inches='tight')

# 4. Count of Products by Category
plt.figure(figsize=(7,4))
# Take first category in the list if multiple categories
df['main_category'] = df['categories'].apply(lambda x: x.split(',')[0] if pd.notnull(x) else 'Unknown')
sns.countplot(y='main_category', data=df, order=df['main_category'].value_counts().index, palette='magma')
plt.title('Product Count by Main Category')
plt.savefig('./graph/4.png', dpi=600, bbox_inches='tight')

# 5. Heatmap of Average Rating by Brand & Main Category
avg_matrix = df.pivot_table(values='reviews.rating', index='brand', columns='main_category', aggfunc='mean')
plt.figure(figsize=(10,6))
sns.heatmap(avg_matrix, annot=True, fmt=".2f", cmap='YlGnBu')
plt.title('Average Rating by Brand & Main Category')
plt.savefig('./graph/5.png', dpi=600, bbox_inches='tight')

plt.show()

# -------------------------------
# Text Processing & Sentiment
# -------------------------------
from sklearn.feature_extraction.text import TfidfVectorizer
from textblob import TextBlob
import numpy as np

# Sentiment analysis
df['Polarity'] = df['reviews.text'].apply(lambda x: TextBlob(x).sentiment.polarity)
df['Subjectivity'] = df['reviews.text'].apply(lambda x: TextBlob(x).sentiment.subjectivity)

# TF-IDF features
tfidf = TfidfVectorizer(max_features=500)
tfidf_features = tfidf.fit_transform(df['reviews.text']).toarray()

# Combine TF-IDF with sentiment
features = np.hstack((tfidf_features, df[['Polarity', 'Subjectivity']].values))

print("Feature matrix shape:", features.shape)