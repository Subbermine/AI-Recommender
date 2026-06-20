
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from textblob import TextBlob

# -------------------------------
# Load Dataset
# -------------------------------
file_path = './Dataset/Flipkart.csv'
df = pd.read_csv(file_path)

print(df.info())
print(df.head())

# -------------------------------
# Data Cleaning
# -------------------------------

df['Review'] = df['Review'].fillna('')
df['Summary'] = df['Summary'].fillna('')

# Convert types
df['Rate'] = pd.to_numeric(df['Rate'], errors='coerce')
df['product_price'] = pd.to_numeric(df['product_price'], errors='coerce')

df['product_name'] = df['product_name'].str.replace(r'[^\x00-\x7F]+', '', regex=True)

df = df.sample(min(50000, len(df)), random_state=42)


TOP_N = 10
top_products = df['product_name'].value_counts().head(TOP_N).index
df_top = df[df['product_name'].isin(top_products)]


# 1. Distribution of Ratings
plt.figure(figsize=(6,4))
sns.countplot(x='Rate', data=df_top, hue='Rate', palette='viridis', legend=False)
plt.title('Distribution of Ratings')
plt.savefig('./graph/1.png', dpi=300)

# 2. Average Rating per Product (Top 10)
plt.figure(figsize=(10,7))
avg_rating = df_top.groupby('product_name')['Rate'].mean().sort_values(ascending=False)

sns.barplot(x=avg_rating.index, y=avg_rating.values,
            hue=avg_rating.index, palette='coolwarm', legend=False)

plt.xticks(rotation=45, ha='right')
#plt.title('Top 10 Products by Average Rating')
plt.ylabel('Average Rating')
plt.tight_layout()
plt.savefig('./graph/2.png', dpi=300)

# 3. Price vs Rating ( avoid crash)
plt.figure(figsize=(12,10))
sample_df = df_top.sample(min(2000, len(df_top)), random_state=42)

sns.scatterplot(x='Rate', y='product_price',
                data=sample_df, hue='product_name')

plt.title('Price vs Rating (Sampled)')
plt.savefig('./graph/3.png', dpi=300)

# 4. Product Count
plt.figure(figsize=(7,4))
sns.countplot(y='product_name',
              data=df_top,
              order=df_top['product_name'].value_counts().index,
              hue='product_name',
              palette='magma',
              legend=False)

plt.title('Product Count (Top 10)')
plt.savefig('./graph/4.png', dpi=300)

# 5. Heatmap (Rating vs Sentiment)
pivot = df_top.pivot_table(values='Rate',
                           index='product_name',
                           columns='Sentiment',
                           aggfunc='mean')

plt.figure(figsize=(8,5))
sns.heatmap(pivot, annot=True, fmt=".2f", cmap='YlGnBu')
plt.title('Average Rating by Product & Sentiment')
plt.savefig('./graph/5.png', dpi=300)

plt.show()
