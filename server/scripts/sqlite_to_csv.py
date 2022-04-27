import sqlite3
import csv
import os

BENCHMARK_DIR_PATH = os.path.join("server", "assets", "data", 'benchmark')

for directory in os.listdir(BENCHMARK_DIR_PATH):
    if directory.endswith('.csv'):
        continue
    db_path = None
    for file in os.listdir(os.path.join(BENCHMARK_DIR_PATH, directory)):
        if file.endswith(".sqlite"):
            db_path = os.path.join(BENCHMARK_DIR_PATH, directory, file)
            break
    else:
        continue

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
        csv_path = os.path.join(BENCHMARK_DIR_PATH, f"{table}.csv")
        with open(csv_path, "w", newline='', encoding='utf-8') as f:
            try:
                fields = rows[0].keys()
            except IndexError:
                print('ERROR:', table, 'has no data!')
                break
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)