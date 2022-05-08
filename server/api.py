from server.model_setup import get_ncNetInstance, get_nl4dv_instance

from html import escape
import flask as f
import json
import os
from uuid import uuid4


URL = "http://localhost:5000"
SUPPORTED_NL2VIZ_MODELS = {"nl4dv", "ncNet"}
CLIENTS = []

api = f.Blueprint("api", __name__)


class Client:
    def __init__(self, client_id, set_defaults=False) -> None:
        self.client_id = client_id
        self.dataset = ""  # The name of the dataset (includes the extension)
        self.model_type = ""  # The type of model (e.g. "nl4dv" or "ncNet")
        self.nl2viz_instance = None

        if set_defaults:
            self.dataset = "cinema.csv"
            self.set_nl2viz_instance("nl4dv", self.dataset)

    def set_nl2viz_instance(self, model_type, starting_dataset: str = "cinema.csv"):
        self.model_type = model_type
        if model_type == "nl4dv":
            self.nl2viz_instance = get_nl4dv_instance()
        elif model_type == "ncNet":
            self.nl2viz_instance = get_ncNetInstance()

        if starting_dataset:
            self.dataset = starting_dataset
            _switch_dataset(self.nl2viz_instance, self.model_type, self.dataset)

        return self.nl2viz_instance

    def get_current_dataset(self):
        return self.dataset

    def switch_dataset(self, new_dataset):
        _switch_dataset(self.nl2viz_instance, self.model_type, new_dataset)
        self.dataset = new_dataset
        print("Successfully switched dataset to", new_dataset)

    def execute_query(self, query: str) -> dict:
        return _execute_query(self.nl2viz_instance, self.model_type, query)

    def jsonify(self):
        return {
            "client_id": self.client_id,
            "model_type": self.model_type,
            "dataset": self.dataset,
            "has_instance": self.nl2viz_instance is not None,
        }


def _create_client():
    new_client_id = str(uuid4())
    new_client = Client(new_client_id, set_defaults=True)
    CLIENTS.append(new_client)
    f.session["clientId"] = new_client_id
    print("New client created with id:", new_client_id)
    return new_client, "Hello, " + new_client_id


def _get_client(with_message=False):
    if "clientId" not in f.session:
        client, message = _create_client()
    else:
        client_id = f.session["clientId"]
        for client in CLIENTS:
            if client.client_id == client_id:
                print("found client", client.client_id)
                message = "Welcome back, " + client.client_id
                break
        else:
            client, message = _create_client()

    if with_message:
        return {
            "message": message,
            "client": client.jsonify(),
        }
    return client


def _switch_dataset(nl2viz_instance, model_type, dataset):
    if model_type == "nl4dv":
        nl2viz_instance.set_data(
            data_url=os.path.join(
                f.current_app.config["BENCHMARK_PATH"], "data", dataset
            )
        )
    elif model_type == "ncNet":
        nl2viz_instance.specify_dataset(
            data_type="csv",
            table_name=dataset.replace(".csv", ""),
            data_url=os.path.join(
                f.current_app.config["BENCHMARK_PATH"], "data", dataset
            ),
        )


def _execute_query(nl2viz_instance, model_type, query: str) -> dict:
    if model_type == "nl4dv":
        print("EXECUTING QUERY:", query, "on nl4dv")
        result = nl2viz_instance.analyze_query(query)

        # Change the data URL to the localhost URL
        dataset_name = _get_dataset_name_from_path(result["dataset"])
        for vis in result["visList"]:
            new_url = f"{URL}/api/datasets/{dataset_name}"
            vis["vlSpec"]["data"]["url"] = new_url
        result["query"] = query
        return result
    elif model_type == "ncNet":
        try:
            viz = nl2viz_instance.nl2vis(query)[
                0
            ]  # nl2vis will return a list a [Vis, VegaLiteSpec]
        except Exception as e:
            return {"visList": [], "query": query, "query_raw": query.lower().strip()}
        # We don't need to worry about the dataset URL, ncNet is nice enough to
        # encode the data manually
        visObj = {"vlSpec": viz.spec, "attributes": None}
        result = {
            "visList": [visObj],
            "query": query,
            "query_raw": query.lower().strip(),
        }
        return result


def _get_dataset_name_from_path(path: str):
    return os.path.basename(os.path.normpath(path)).strip()


def _find_benchmarks_for_dataset(dataset_name: str):
    dataset_name = dataset_name.replace(".csv", "")
    benchmark_meta_path = os.path.join(
        f.current_app.config["BENCHMARK_PATH"], "benchmark_meta.json"
    )
    table_to_benchmark_lookup_path = os.path.join(
        f.current_app.config["BENCHMARK_PATH"], "table_to_benchmark_lookup.json"
    )

    with open(benchmark_meta_path, "r") as file:
        benchmark_metadata: dict = json.load(file)

    with open(table_to_benchmark_lookup_path, "r") as file:
        lookup = json.load(file)

    b_ids = lookup[dataset_name]
    print("Getting benchmarks with", dataset_name)
    benchmarks_with_dataset = [
        benchmark for b_id, benchmark in benchmark_metadata.items() if b_id in b_ids
    ]
    return benchmarks_with_dataset


@api.route("/client")
def client_handler():
    res = _get_client(with_message=True)
    return f.jsonify(res)


@api.route("/clients")
def clients_handler():
    return {"clients": [client.jsonify() for client in CLIENTS]}


@api.route("/dataset", methods=["GET", "POST"])
def dataset_handler():
    benchmark_data_path = os.path.join(f.current_app.config["BENCHMARK_PATH"], "data")
    client = _get_client()
    if f.request.method == "GET":
        try:
            dataset_name = client.get_current_dataset()
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
            response = f.jsonify({"message": f'Dataset "{new_dataset}" not found.'})
            response.status_code = 404
            return response
        print("About to switch dataset to", new_dataset)
        client.switch_dataset(new_dataset)
        return {
            "message": f"Successfully switched dataset to {new_dataset}",
            "response": new_dataset,
        }


@api.route("/datasets")
@api.route("/datasets/<dataset_name>")
def datasets_handler(dataset_name=None):
    benchmark_data_path = os.path.join(f.current_app.config["BENCHMARK_PATH"], "data")

    # Send all datasets if no dataset name is specified
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


@api.route("/benchmark/<dataset_name>/queries")
def benchmark_handler(dataset_name: str):
    """Get the benchmark's NL queries for the given dataset."""
    dataset_name = dataset_name.replace(".csv", "")
    all_benchmarks = _find_benchmarks_for_dataset(dataset_name)
    possible_queries = []
    for benchmark in all_benchmarks:
        possible_queries.extend(benchmark["nl_queries"])
    return {
        "message": f"Possible NL benchmark queries for {dataset_name}",
        "response": possible_queries,
    }


@api.route("/execute/")
def execute_handler():
    """Only executes the query, does not try to yield the benchmark"""
    client = _get_client()
    query = f.request.args.get("query")
    if not query:
        f.abort(400, description="No query specified.")

    result = client.execute_query(query)
    return {
        "message": f"Successfully executed query: {query}",
        "response": result,
    }


@api.route("/benchmark/execute")
def benchmark_execute_handler():
    client = _get_client()
    query = f.request.args.get("query")
    if not query:
        f.abort(400, description="No query specified.")

    dataset_name = client.get_current_dataset()
    print("Client's current dataset:", dataset_name)
    all_benchmarks = _find_benchmarks_for_dataset(dataset_name)
    benchmarks_with_query = [
        benchmark for benchmark in all_benchmarks if query in benchmark["nl_queries"]
    ]

    model_result = client.execute_query(query)
    return {
        "message": f'Successfully executed query. Benchmark query "{query}" found in {len(benchmarks_with_query)} benchmark(s)',
        "response": {"benchmark": benchmarks_with_query, "model_result": model_result},
    }


@api.route("/model", methods=["GET", "POST"])
def model_handler():
    client = _get_client()
    if f.request.method == "GET":
        # If GET, returns the client's current model
        return {
            "message": "Successfully retrieved model name",
            "response": client.model_type,
        }
    elif f.request.method == "POST":
        # On POST request, switch the dataset being used by the model
        form = f.request.get_json()
        new_model = form["model"]
        print("Switching model to", new_model)
        if not new_model:
            response = f.jsonify({"message": f"No model specified."})
            response.status_code = 400
            return response
        if new_model not in SUPPORTED_NL2VIZ_MODELS:
            f.abort(
                404,
                description=f'Model "{new_model}" not supported, please choose one of {SUPPORTED_NL2VIZ_MODELS}',
            )
        model_obj = client.set_nl2viz_instance(
            new_model, starting_dataset=client.dataset
        )
        return {
            "message": f"Successfully switched model to {new_model}",
            "response": new_model,
        }


@api.route("/models")
def models_handler():
    return {
        "message": "Successfully fetched all supported models",
        "response": list(SUPPORTED_NL2VIZ_MODELS),
    }
