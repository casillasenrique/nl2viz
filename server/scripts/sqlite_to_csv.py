import sqlite3
import config
import json
import csv
import os


def convert_sqlite_to_csv():
    # Benchmark data is stored per benchmark in a directory
    for blob in os.listdir(config.BENCHMARK_DATA_DIR_PATH):
        if blob.endswith(".csv"):
            continue    
        
        for file in os.listdir(os.path.join(config.BENCHMARK_DATA_DIR_PATH, blob)):
            # There should only be one .sqlite file in the directory
            if file.endswith(".sqlite"):
                db_path = os.path.join(config.BENCHMARK_DATA_DIR_PATH, blob, file)
                break
        else:
            print(f"No .sqlite file found in {blob}")

        # Connect to the database
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        # Get all of the table names
        table_names = cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
        ).fetchall()
        
        # Extract all of the table content into the data dictionary
        data = {}
        for (table,) in table_names:
            cursor = cur.execute(f"SELECT * FROM {table}")
            column_names = [description[0] for description in cursor.description]
            try:
                data[table] = [dict(zip(column_names, row)) for row in cursor.fetchall()]
            except sqlite3.OperationalError as e:
                print(f"{e}\n Skipping {table}")
        conn.close()

        # Write the data to a csv file for each table
        for table, rows in data.items():
            csv_path = os.path.join(config.BENCHMARK_DATA_DIR_PATH, f"{table}.csv")
            with open(csv_path, "w", newline="", encoding="utf-8") as f:
                try:
                    fields = rows[0].keys()
                except IndexError:
                    print(f"ERROR: {table} has no data! (from {db_path})")
                    break
                writer = csv.DictWriter(f, fieldnames=fields)
                writer.writeheader()
                writer.writerows(rows)

def delete_csvs_with_no_benchmark():
    # Read the benchmark meta file
    with open(config.BENCHMARK_META_PATH, "r") as f:
        benchmark_meta = json.load(f)
    
    tables_with_benchmark = set()
    for benchmark in benchmark_meta:
        tables_used = benchmark["tables_used"]
        if len(tables_used) != 1:
            # Ignore benchmarks that use more than one table (nl4dv does not
            # support JOINs)
            continue
    
        table = tables_used[0]
        tables_with_benchmark.add(table)

    # Delete all csv files that do not have a benchmark
    for blob in os.listdir(config.BENCHMARK_DATA_DIR_PATH):
        if not blob.endswith(".csv"):
            continue
        table = blob.replace(".csv", "")
        if table not in tables_with_benchmark:
            print(f'Deleting {blob}...')
            os.remove(os.path.join(config.BENCHMARK_DATA_DIR_PATH, blob))
    

if __name__ == "__main__":
    # convert_sqlite_to_csv()
    delete_csvs_with_no_benchmark()
