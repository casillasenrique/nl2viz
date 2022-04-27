import config
import os
import json

# Read the json file from config.BENCHMARK_JSON_PATH
with open(config.BENCHMARK_JSON_PATH, "r") as f:
    benchmark_data: dict = json.load(f)

benchmark_meta = []
for benchmark in benchmark_data.values():
    sql_query = benchmark["vis_query"]["data_part"]["sql_part"]
    has_join = "JOIN" in sql_query

    sql_query_tokens = sql_query.split()
    tables_used = [
        sql_query_tokens[i + 1]
        for i in range(len(sql_query_tokens) - 1)
        if sql_query_tokens[i] == "FROM"
    ]

    benchmark_meta.append(
        {
            'tables_used': tables_used,
            "db_id": benchmark["db_id"],
            "nl_queries": benchmark["nl_queries"],
            "vega_spec": benchmark["vis_obj"],
        }
    )


with open(config.BENCHMARK_META_PATH, "w") as f:
    json.dump(benchmark_meta, f, indent=4)
