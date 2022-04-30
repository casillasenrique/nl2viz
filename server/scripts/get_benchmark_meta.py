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


# import time

# # Data processing.
# import pandas as pd

# # "Vanilla" python parallelism.
# import multiprocessing

# # Scalable data analytics: dask.
# import dask.bag as db
# from dask.distributed import Client, LocalCluster

# import json

# import warnings

# warnings.filterwarnings("ignore")

# import logging

# def save_benchmarks_with_single_databases():
#     n_cores = multiprocessing.cpu_count()
#     print("Number of cores we have: ", n_cores)

#     # Create a cluster and client
#     print("> Creating a cluster and client...")
#     cluster = LocalCluster(
#         ip=None,
#         n_workers=n_cores,
#         processes=True,
#         silence_logs=logging.ERROR,
#         # interface="lo",
#     )
#     client = Client(cluster)

#     print("Succesfully connected to cluster")

#     # COMPUTATION
#     t1_start = time.perf_counter()
#     # Load notebook runs using the same method from lecture
#     events: db.Bag = db.read_text(
#         "https://archive.analytics.mybinder.org/index.jsonl"
#     )
#     events = events.map(json.loads)
#     events = events.filter(lambda entry: "2022" in entry["date"])
#     events = events.pluck("name")
#     urls = events.map(lambda name: f"https://archive.analytics.mybinder.org/{name}")
#     notebook_runs: db.Bag = db.read_text(urls.compute()).map(json.loads)

#     res = notebook_runs.foldby(
#         "provider",
#         lambda count, y: count + 1,
#         0,
#         lambda total1, total2: total1 + total2,
#     )
#     # Get the top 3 providers by count and report result
#     top3 = res.topk(3, key=lambda freq_pair: freq_pair[1])
#     print(f"Result: {top3.take(3)}")
#     t1_stop = time.perf_counter()

#     # Calculate time elapsed
#     elapsed = (t1_stop - t1_start) * 1000
#     print(f"Elapsed time (ms): {elapsed}")


# # # Read the json file from config.BENCHMARK_JSON_PATH
# # with open(config.BENCHMARK_JSON_PATH, "r") as f:
# #     benchmark_data: dict = json.load(f)

# # benchmark_meta = []
# # for benchmark in benchmark_data.values():
# #     sql_query = benchmark["vis_query"]["data_part"]["sql_part"]
# #     has_join = "JOIN" in sql_query

# #     sql_query_tokens = sql_query.split()
# #     tables_used = [
# #         sql_query_tokens[i + 1]
# #         for i in range(len(sql_query_tokens) - 1)
# #         if sql_query_tokens[i] == "FROM" or sql_query_tokens[i] == "JOIN"
# #     ]

# #     benchmark_meta.append(
# #         {
# #             "tables_used": tables_used,
# #             "db_id": benchmark["db_id"],
#             "nl_queries": benchmark["nl_queries"],
#             "vega_spec": benchmark["vis_obj"],
#         }
#     )


# with open(config.BENCHMARK_META_PATH, "w") as f:
#     json.dump(benchmark_meta, f, indent=4)


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


if __name__ == "__main__":
    save_benchmarks_with_one_table()
