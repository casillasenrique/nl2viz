from flask import Flask, send_from_directory, request, session
from flask_restful import Api
from flask_cors import CORS
from server.api import api
from flask_session import Session
import os


app = Flask(__name__, static_url_path="", static_folder="client/build")
SESSION_TYPE = 'filesystem'
CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"
app.config["CSV_DATA"] = os.path.join("server", "assets", "data")
app.config["BENCHMARK_PATH"] = os.path.join("server", "assets", "benchmark")
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = SESSION_TYPE

@app.route("/", defaults={"path": ""})
def serve(path):
    return send_from_directory(app.static_folder, "index.html")

@app.after_request
def after_request(response):
  response.headers.add('Access-Control-Allow-Origin', '*')
  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  return response

app.register_blueprint(api, url_prefix="/api")

