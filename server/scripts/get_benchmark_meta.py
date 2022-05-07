import re
import config
import os
import json
from bs4 import BeautifulSoup
import ast


def save_benchmark_meta():
    benchmark_meta = []
    batch_num = 0
    for i, html_filename in enumerate(os.listdir(config.BENCHMARK_HTML_DIR_PATH)):
        if (i + 1) % 1000 == 0:
            print(f"SAVING BATCH {batch_num}")
            with open(
                os.path.join(config.BENCHMARK_DIR_PATH, f"bench-meta-{batch_num}.json"),
                "w",
            ) as f:
                json.dump(benchmark_meta, f, indent=4)
            batch_num += 1
            benchmark_meta = []
            print("Creating new batch...")

        filepath = os.path.join(config.BENCHMARK_HTML_DIR_PATH, html_filename)
        print("Processing file: {}".format(filepath))
        with open(filepath, "r", encoding="utf-8") as f:
            contents = f.read()

            soup = BeautifulSoup(contents, "html.parser")

            # Find the SQL query and get the tables used
            p_with_sql_query = [
                p for p in soup.find_all("p") if p.text.startswith("Visualize")
            ][0]
            sql_query = p_with_sql_query.text.replace("Visualize", "").strip()

            # The last <script> tag is the one that contains the Vega-Lite spec
            script_contents = str(soup.find_all("script")[-1])
            start_index = script_contents.find("vlSpec1  =")
            end_index = script_contents.rfind("}")
            vega_lite_spec = (
                script_contents[start_index : end_index + 1]
                .replace("vlSpec1  =", "")
                .strip()
            )
            vega_lite_spec = ast.literal_eval(vega_lite_spec)

            # Find the DB ID
            b_with_db_id = [b for b in soup.find_all("b") if b.text.startswith("DB:")][
                0
            ]
            db_id = re.sub(
                r"(DB:|\s)", "", b_with_db_id.parent.text.strip().replace("DB:", "")
            )

            # Find the NL queries and SQL query (in the same element)
            h4_with_nl_queries = [
                h4 for h4 in soup.find_all("h4") if h4.text.startswith("NL Queries")
            ][0]
            info = h4_with_nl_queries.parent.find_all("p")
            sql_query = re.sub(
                r"\s", " ", info[-1].text.replace("Visualize", "").strip()
            )
            sql_query_tokens = sql_query.split()
            tables_used = [
                sql_query_tokens[i + 1]
                for i in range(len(sql_query_tokens) - 1)
                if sql_query_tokens[i] == "FROM" or sql_query_tokens[i] == "JOIN"
            ]

            ps_with_nl_queries = info[:-1]
            nl_queries = [
                " ".join(nl_queries.text.strip().replace("\n", "").split())
                for nl_queries in ps_with_nl_queries
            ]

            benchmark_meta.append(
                {
                    "tables_used": tables_used,
                    "db_id": db_id,
                    "nl_queries": nl_queries,
                    "vega_spec": vega_lite_spec,
                }
            )

    with open(
        os.path.join(config.BENCHMARK_DIR_PATH, f"bench-meta-{batch_num}.json"), "w"
    ) as f:
        json.dump(benchmark_meta, f, indent=4)


def save_benchmarks_with_one_table():
    benchmarks_with_one_table = []
    for meta_file in os.listdir(config.BENCHMARK_DIR_PATH):
        if not meta_file.endswith(".json"):
            continue
        with open(
            os.path.join(config.BENCHMARK_DIR_PATH, meta_file), "r", encoding="utf-8"
        ) as f:
            metadata = json.load(f)
            benchmarks_with_one_table.extend(
                [
                    benchmark
                    for benchmark in metadata
                    if len(benchmark["tables_used"]) == 1
                ]
            )

    with open(config.BENCHMARK_META_PATH, "w", encoding="utf-8") as f:
        json.dump(benchmarks_with_one_table, f, indent=4)
    return benchmarks_with_one_table


def save_table_to_benchmark_lookup():
    with open(config.BENCHMARK_META_PATH, "r", encoding="utf-8") as f:
        benchmarks = json.load(f)
        
    table_to_benchmark_lookup = {}
    for b_id, benchmark in benchmarks.items():
        for table in benchmark["tables_used"]:
            table_to_benchmark_lookup[table] = [b_id] + table_to_benchmark_lookup.get(table, [])
        
    with open(config.TABLE_TO_BENCHMARK_LOOKUP_PATH, "w", encoding="utf-8") as f:
        json.dump(table_to_benchmark_lookup, f, indent=4)
    

# def add_benchmark_id_to_meta():
#     with open(config.BENCHMARK_META_PATH, "r", encoding="utf-8") as f:
#         benchmarks = json.load(f)

#     new_meta = {}
#     for benchmark in benchmarks:
#         new_meta[benchmark['id']] = {
#             'tables_used': benchmark['tables_used'],
#             'original_db_id': benchmark['db_id'],
#             'nl_queries': benchmark['nl_queries'],
#             'vega_spec': benchmark['vega_spec'],
#         }
        
#     with open(config.BENCHMARK_META_PATH, "w", encoding="utf-8") as f:
#         json.dump(new_meta, f, indent=4)

if __name__ == "__main__":
    # save_benchmarks_with_one_table()
    # add_benchmark_id_to_meta()
    save_table_to_benchmark_lookup()
