import sqlite3
import json
import os

DB_PATH = 'database.db'
DATA_DIR = 'Dataset'
FASHION_FILE = os.path.join(DATA_DIR, 'Amazon_Fashion.jsonl')
ELECTRONICS_FILE = os.path.join(DATA_DIR, 'Electronics.jsonl')

MAX_RECORDS_PER_FILE = 5000

def create_tables(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            asin TEXT PRIMARY KEY,
            category TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asin TEXT,
            rating REAL,
            title TEXT,
            text TEXT,
            user_id TEXT,
            timestamp INTEGER,
            helpful_vote INTEGER,
            verified_purchase INTEGER,
            FOREIGN KEY(asin) REFERENCES products(asin)
        )
    ''')
    
    cursor.execute('''
        CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_reviews 
        ON reviews (asin, COALESCE(user_id, ''), COALESCE(timestamp, 0), COALESCE(text, ''))
    ''')

def populate_from_jsonl(cursor, filepath, category, max_records):
    print(f"Populating from {filepath} (Category: {category})...")
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    count = 0
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            if count >= max_records:
                break
            try:
                data = json.loads(line)
                asin = data.get('asin')
                if not asin:
                    continue
                
                # Insert product (ignore if already exists)
                cursor.execute('''
                    INSERT OR IGNORE INTO products (asin, category)
                    VALUES (?, ?)
                ''', (asin, category))
                
                # Insert review (ignore duplicates)
                cursor.execute('''
                    INSERT OR IGNORE INTO reviews (asin, rating, title, text, user_id, timestamp, helpful_vote, verified_purchase)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    asin,
                    data.get('rating'),
                    data.get('title'),
                    data.get('text'),
                    data.get('user_id'),
                    data.get('timestamp'),
                    data.get('helpful_vote'),
                    1 if data.get('verified_purchase') else 0
                ))
                
                count += 1
            except json.JSONDecodeError:
                continue
    print(f"Inserted {count} records from {category}.")

def main():
    if os.path.exists(DB_PATH):
        print(f"Removing existing database {DB_PATH}")
        os.remove(DB_PATH)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    create_tables(cursor)
    
    populate_from_jsonl(cursor, FASHION_FILE, 'Amazon_Fashion', MAX_RECORDS_PER_FILE)
    populate_from_jsonl(cursor, ELECTRONICS_FILE, 'Electronics', MAX_RECORDS_PER_FILE)
    
    conn.commit()
    conn.close()
    print("Database setup complete.")

if __name__ == '__main__':
    main()
