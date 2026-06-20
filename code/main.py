import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load dataset
file_path = './Dataset/Womens Clothing E-Commerce Reviews.csv'
df = pd.read_csv(file_path)

print(df.info())
print(df.head())

# -------------------------------
# Data Cleaning 
# -------------------------------

df['Review Text'] = df['Review Text'].fillna('')

# Convert 'Rating' to numeric if not already
df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce')

# -------------------------------
# Visualization
# -------------------------------
# 1. Distribution of Ratings
plt.figure(figsize=(6,4))
sns.countplot(x='Rating', data=df, palette='viridis')
plt.title('Distribution of Ratings')
plt.savefig('./graph/1.png', dpi=600, bbox_inches='tight')

# 2. Average Rating per Category (Division Name)
plt.figure(figsize=(7,4))
avg_rating_div = df.groupby('Division Name')['Rating'].mean().sort_values()
sns.barplot(x=avg_rating_div.index, y=avg_rating_div.values, palette='coolwarm')
plt.xticks(rotation=45)
plt.title('Average Rating per Division')
plt.ylabel('Average Rating')
plt.savefig('./graph/2.png', dpi=600, bbox_inches='tight')


# 3. Positive Feedback Count vs Rating
plt.figure(figsize=(7,4))
sns.scatterplot(x='Rating', y='Positive Feedback Count', data=df, hue='Division Name', palette='Set2')
plt.title('Positive Feedback Count vs Rating')
plt.savefig('./graph/3.png', dpi=600, bbox_inches='tight')
plt.close()

# 4. Count of Products by Class Name
plt.figure(figsize=(7,4))
sns.countplot(y='Class Name', data=df, order=df['Class Name'].value_counts().index, palette='magma')
plt.title('Product Count by Class Name')
plt.savefig('./graph/4.png', dpi=600, bbox_inches='tight')


# 5. Heatmap of Average Rating by Division & Department
avg_matrix = df.pivot_table(values='Rating', index='Division Name', columns='Department Name', aggfunc='mean')
plt.figure(figsize=(7,4))
sns.heatmap(avg_matrix, annot=True, fmt=".2f", cmap='YlGnBu')
plt.title('Average Rating by Division & Department')
plt.savefig('./graph/5.png', dpi=600, bbox_inches='tight')

plt.show()


from sklearn.feature_extraction.text import TfidfVectorizer
from textblob import TextBlob

# Sentiment analysis
df['Polarity'] = df['Review Text'].apply(lambda x: TextBlob(x).sentiment.polarity)
df['Subjectivity'] = df['Review Text'].apply(lambda x: TextBlob(x).sentiment.subjectivity)

# TF-IDF features
tfidf = TfidfVectorizer(max_features=500)
tfidf_features = tfidf.fit_transform(df['Review Text']).toarray()

# Combine TF-IDF with sentiment
import numpy as np
features = np.hstack((tfidf_features, df[['Polarity', 'Subjectivity']].values))

print("Feature matrix shape:", features.shape)
exec(open('test.py').read())