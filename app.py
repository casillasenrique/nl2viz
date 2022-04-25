from flask import Flask, send_from_directory
from flask_restful import Api
from flask_cors import CORS  # comment this on deployment
from server import api as endpoints
import os


app = Flask(__name__, static_url_path="", static_folder="client/build")
CORS(app)
api = Api(app)

app.config["CORS_HEADERS"] = "Content-Type"
app.config["CSV_DATA"] = os.path.join("server", "assets", "data")


@app.route("/", defaults={"path": ""})
def serve(path):
    return send_from_directory(app.static_folder, "index.html")


api.add_resource(endpoints.HelloHandler, "/api/hello")
api.add_resource(endpoints.ExecuteHandler, "/api/execute/")
api.add_resource(endpoints.DataHandler, "/api/data/<string:dataset_name>")
