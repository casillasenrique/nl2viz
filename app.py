from flask import Flask, send_from_directory, request
from flask_restful import Api
from flask_cors import CORS
from server.api import api
import os


app = Flask(__name__, static_url_path="", static_folder="client/build")
CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"
app.config["CSV_DATA"] = os.path.join("server", "assets", "data")


@app.route("/", defaults={"path": ""})
def serve(path):
    return send_from_directory(app.static_folder, "index.html")

app.register_blueprint(api, url_prefix="/api")

