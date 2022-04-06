from flask import Flask, abort, request, escape, send_from_directory
from flask_cors import CORS, cross_origin
from nl4dv_setup import get_nl4dv_instance
import os
import re

URL = "http://localhost:5000"

app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"
app.config["CSV_DATA"] = os.path.join(".", "assets", "data")


nl4dv_instance = get_nl4dv_instance()


@app.route("/execute")
@cross_origin()
def hello_world():
    query = request.args.get("q")
    if not query:
        abort(400)

    print(query)
    result = {}
    result = nl4dv_instance.analyze_query(query)

    # Change the data URL to the localhost URL
    dataset_name = re.split(r"(/|\\)", result["dataset"])[-1]
    print(dataset_name)
    for vis in result["visList"]:
        vis["vlSpec"]["data"]["url"] = f"{URL}/data/{dataset_name}"

    return {
        "content": "<p>Hello, World!</p>",
        "query": query,
        "response": result,
    }


@app.route("/data/<name>")
def data(name):
    filename = escape(name)
    print("Got filename:", filename)
    filepath = os.path.join(".", "assets", "data")
    print(filepath)
    try:
        return send_from_directory(app.config["CSV_DATA"], filename)
    except FileNotFoundError:
        abort(404)


if __name__ == "__main__":
    app.run(debug=True)
