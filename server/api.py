from html import escape
from flask_cors import cross_origin
from flask_restful import Resource, reqparse
import flask as f

from server.nl4dv_setup import get_nl4dv_instance, switch_dataset

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
    print("Got filename:", filename)
    filepath = os.path.join(".", "assets", "data")
    print(filepath)
    try:
        return f.send_from_directory(f.current_app.config["CSV_DATA"], filename)
    except FileNotFoundError:
        f.abort(404, description=f'Dataset "{filename}" not found.')


@api.route("/execute/")
def execute_handler():
    query = f.request.args.get("query")
    if not query:
        f.abort(400, description="No query specified.")

    print(query)
    result = {}
    result = nl4dv_instance.analyze_query(query)

    # Change the data URL to the localhost URL
    dataset_name = re.split(r"(/|\\)", result["dataset"])[-1]
    print(dataset_name)
    for vis in result["visList"]:
        vis["vlSpec"]["data"]["url"] = f"{URL}/api/datasets/{dataset_name}"

    return {
        "message": f"Successfully executed query: {query}",
        "response": result,
    }

