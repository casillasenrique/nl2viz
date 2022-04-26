from html import escape
from flask_restful import Resource, reqparse
import flask as f

from server.nl4dv_setup import get_nl4dv_instance, switch_dataset

import os
import re

URL = "http://localhost:5000"

nl4dv_instance = get_nl4dv_instance()


class HelloHandler(Resource):
    def get(self):
        return {"message": "Hello World!"}


class ExecuteHandler(Resource):
    def get(self):
        query = f.request.args.get("query")
        if not query:
            f.abort(400)

        print(query)
        result = {}
        result = nl4dv_instance.analyze_query(query)

        # Change the data URL to the localhost URL
        dataset_name = re.split(r"(/|\\)", result["dataset"])[-1]
        print(dataset_name)
        for vis in result["visList"]:
            vis["vlSpec"]["data"]["url"] = f"{URL}/api/data/{dataset_name}"

        return {
            "content": "<p>Hello, World!</p>",
            "query": query,
            "response": result,
        }

    def post(self):
        print(self)
        parser = reqparse.RequestParser()
        parser.add_argument("type", type=str)
        parser.add_argument("message", type=str)

        args = parser.parse_args()

        print(args)
        # note, the post req from frontend needs to match the strings here (e.g. 'type and 'message')

        request_type = args["type"]
        request_json = args["message"]
        # ret_status, ret_msg = ReturnData(request_type, request_json)
        # currently just returning the req straight
        ret_status = request_type
        ret_msg = request_json

        if ret_msg:
            message = "Your Message Requested: {}".format(ret_msg)
        else:
            message = "No Msg"

        final_ret = {"status": "Success", "message": message}

        return final_ret


class DataHandler(Resource):
    def get(self, dataset_name):
        filename = escape(dataset_name)
        print("Got filename:", filename)
        filepath = os.path.join(".", "assets", "data")
        print(filepath)
        try:
            return f.send_from_directory(f.current_app.config["CSV_DATA"], filename)
        except FileNotFoundError:
            f.abort(404)


class DatasetsHandler(Resource):
    def get(self):
        filepath = os.path.join("server", "assets", "data")
        return {
            "message": "Successfully fetched all stored data (names of files only)",
            "data": os.listdir(filepath),
        }
    
    def post(self):
        """Switch the dataset to use for the model."""
        print(f.request.form)
        
        new_dataset = f.request.form["dataset"]
        if not new_dataset:
            f.abort(400, description="No dataset specified.")
        if new_dataset not in os.listdir(f.current_app.config["CSV_DATA"]):
            f.abort(404, description=f'Dataset "{new_dataset}" not found.')
            
        switch_dataset(nl4dv_instance, new_dataset)
        return {"message": f"Successfully switched dataset to {new_dataset}"}
        
