import sqlite3
import csv
import os

db_path = os.path.join("server", "assets", "data", "cinema", "cinema.sqlite")

conn = sqlite3.connect(db_path)
cur = conn.cursor()
table_names = cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;").fetchall()
data = {}
print(table_names)
for table, in table_names:
    cursor = cur.execute(f"SELECT * FROM {table}")
    column_names = [description[0] for description in cursor.description]
    data[table] = [dict(zip(column_names, row)) for row in cursor.fetchall()]
conn.close()

print(data)


for table, rows in data.items():
    csv_path = os.path.join("server", "assets", "data", "cinema", f"{table}.csv")
    with open(csv_path, "w", newline='', encoding='utf-8') as f:
        fields = rows[0].keys()
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)