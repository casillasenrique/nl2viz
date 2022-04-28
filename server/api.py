from server.nl4dv_setup import get_nl4dv_instance, switch_dataset
from flask_restful import Resource, reqparse
from flask_cors import cross_origin
from html import escape
import flask as f
import json
import os
import re


URL = "http://localhost:5000"

nl4dv_instance = get_nl4dv_instance()

api = f.Blueprint("api", __name__)


@api.route("/test")
def accountList():
    return "list of accounts"


@api.route("/dataset", methods=["GET", "POST"])
def dataset_handler():
    if f.request.method == "GET":
        try:
            dataset_name = nl4dv_instance.data_url
            return {
                "message": "Successfully retrieved current dataset",
                "response": dataset_name,
            }
        except Exception as e:
            f.abort(500, message=str(e))
    elif f.request.method == "POST":
        # On POST request, switch the dataset being used by the model
        form = f.request.get_json()
        new_dataset = form["dataset"]
        if not new_dataset:
            f.abort(400, description="No dataset specified.")
        if new_dataset not in os.listdir(f.current_app.config["CSV_DATA"]):
            f.abort(404, description=f'Dataset "{new_dataset}" not found.')

        switch_dataset(nl4dv_instance, new_dataset)
        print("success")
        return {
            "message": f"Successfully switched dataset to {new_dataset}",
            "response": new_dataset,
        }


@api.route("/datasets")
@api.route("/datasets/<dataset_name>")
def datasets_handler(dataset_name=None):
    if dataset_name is None or dataset_name == "":
        return {
            "message": "Successfully fetched all stored data (names of files only)",
            "response": os.listdir(f.current_app.config["CSV_DATA"]),
        }

    filename = escape(dataset_name)
    try:
        return f.send_from_directory(f.current_app.config["CSV_DATA"], filename)
    except FileNotFoundError:
        f.abort(404, description=f'Dataset "{filename}" not found.')


def get_dataset_name_from_path(path: str):
    return os.path.basename(os.path.normpath(path)).strip()


def execute_query(query: str, is_benchmark: bool = False):
    result = nl4dv_instance.analyze_query(query)

    # Change the data URL to the localhost URL
    dataset_name = get_dataset_name_from_path(result["dataset"])
    for vis in result["visList"]:
        new_url = f"{URL}/api/datasets/{dataset_name}"
        if is_benchmark:
            new_url = f"{URL}/api/benchmark/datasets/{dataset_name}"
        vis["vlSpec"]["data"]["url"] = new_url

    return result


@api.route("/execute/")
def execute_handler():
    query = f.request.args.get("query")
    if not query:
        f.abort(400, description="No query specified.")

    result = execute_query(query)
    return {
        "message": f"Successfully executed query: {query}",
        "response": result,
    }


def find_benchmarks_for_dataset(dataset_name: str):
    dataset_name = dataset_name.replace(".csv", "")
    with open(
        f"{f.current_app.config['BENCHMARK_DATA']}/benchmark_meta.json", "r"
    ) as file:
        benchmark_metadata = json.load(file)

    print("searching for benchmarks with", dataset_name)

    print("Faculty" in benchmark_metadata[0]["tables_used"])
    benchmarks_with_dataset = [
        benchmark
        for benchmark in benchmark_metadata
        if dataset_name in benchmark["tables_used"]
        and len(benchmark["tables_used"]) == 1
    ]
    return benchmarks_with_dataset


@api.route("/benchmark/datasets")
@api.route("/benchmark/datasets/<dataset_name>")
def benchmark_datasets_handler(dataset_name=None):
    benchmark_data_path = os.path.join("server", "assets", "benchmark", "data")
    if dataset_name is None or dataset_name == "":
        return {
            "message": "Successfully fetched all stored data (names of files only)",
            "response": os.listdir(benchmark_data_path),
        }

    filename = escape(dataset_name)
    try:
        return f.send_from_directory(benchmark_data_path, filename)
    except FileNotFoundError:
        f.abort(404, description=f'Dataset "{filename}" not found.')


@api.route("/benchmark/dataset", methods=["GET", "POST"])
def benchmark_dataset_handler():
    benchmark_data_path = os.path.join("server", "assets", "benchmark", "data")
    
    if f.request.method == "GET":
        try:
            dataset_name = nl4dv_instance.data_url
            return {
                "message": "Successfully retrieved current dataset",
                "response": dataset_name,
            }
        except Exception as e:
            f.abort(500, message=str(e))
    elif f.request.method == "POST":
        # On POST request, switch the dataset being used by the model
        form = f.request.get_json()
        new_dataset = form["dataset"]
        if not new_dataset:
            f.abort(400, description="No dataset specified.")
        if new_dataset not in os.listdir(benchmark_data_path):
            f.abort(404, description=f'Dataset "{new_dataset}" not found.')

        switch_dataset(nl4dv_instance, new_dataset, is_benchmark=True)
        print("success")
        return {
            "message": f"Successfully switched dataset to {new_dataset}",
            "response": new_dataset,
        }


@api.route("/benchmark/<dataset_name>/queries")
def benchmark_handler(dataset_name: str):
    """Get the benchmark's NL queries for the given dataset."""
    dataset_name = dataset_name.replace(".csv", "")
    all_benchmarks = find_benchmarks_for_dataset(dataset_name)
    possible_queries = []
    for benchmark in all_benchmarks:
        possible_queries.extend(benchmark["nl_queries"])
    return {
        "message": f"Possible NL benchmark queries for {dataset_name}",
        "response": possible_queries,
    }


@api.route("/benchmark/execute")
def benchmark_execute_handler():

    query = f.request.args.get("query")
    if not query:
        f.abort(400, description="No query specified.")

    dataset_name = get_dataset_name_from_path(nl4dv_instance.data_url).replace(
        ".csv", ""
    )
    print("dataset_name:", dataset_name)
    all_benchmarks = find_benchmarks_for_dataset(dataset_name)
    benchmarks_with_query = [
        benchmark for benchmark in all_benchmarks if query in benchmark["nl_queries"]
    ]

    model_result = execute_query(query, is_benchmark=True)
    return {
        "message": f'Successfully executed query. Benchmark query "{query}" found in {len(benchmarks_with_query)} benchmark(s)',
        "response": {"benchmark": benchmarks_with_query, "model_result": model_result},
    }
