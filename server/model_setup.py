from nl4dv import NL4DV
import os

print(__file__)
DATA_PATH = os.path.join("server", "assets", "data")
MODELS_PATH = os.path.join("server", "models")


def get_nl4dv_instance():
    # Change back to the root directory
    # os.path.dirname(os.path.realpath(__file__))

    # os.chdir(os.path.join(".."))
    # print(os.path.dirname(os.path.realpath(__file__)))
    # os.chdir(os.path.dirname(os.path.abspath(__file__)))
    # Initialize an instance of NL4DV
    # ToDo: verify the path to the source data file. modify accordingly.
    nl4dv_instance = NL4DV(
        data_url=os.path.join(DATA_PATH, "cinema.csv"),
    )

    # using Stanford Core NLP
    # ToDo: verify the paths to the jars. modify accordingly.
    # dependency_parser_config = {
    #     "name": "corenlp",
    #     "model": os.path.join(
    #         MODELS_PATH,
    #         "nl4dv",
    #         "server-jars",
    #         "stanford-english-corenlp-2018-10-05-models.jar",
    #     ),
    #     "parser": os.path.join(
    #         MODELS_PATH,
    #         "nl4dv",
    #         "server-jars",
    #         "stanford-parser.jar",
    #     ),
    # }

    # using Stanford CoreNLPServer
    # ToDo: verify the URL to the CoreNLPServer. modify accordingly.
    # dependency_parser_config = {"name": "corenlp-server", "url": "http://localhost:9000"}

    # using Spacy
    # ToDo: ensure that the below spacy model is installed. if using another model, modify accordingly.
    dependency_parser_config = {"name": "spacy", "model": "en_core_web_sm", "parser": None}

    # Set the Dependency Parser
    nl4dv_instance.set_dependency_parser(config=dependency_parser_config)

    return nl4dv_instance


def get_ncNetInstance():
    from .models.ncNet.ncNet import ncNet

    trained_ncNet_model_path = os.path.join(
        MODELS_PATH, "ncNet", "save_models", "trained_model.pt"
    )
    ncNetInstance = ncNet(trained_model=trained_ncNet_model_path)
    ncNetInstance.specify_dataset(
        data_type="csv",
        table_name="cinema",
        data_url=os.path.join(DATA_PATH, "cinema.csv"),
    )
    return ncNetInstance


if __name__ == "__main__":
    # Simple test
    ncNetInstance = get_ncNetInstance()
    print(ncNetInstance.show_dataset())

    # nl4dv_instance = get_nl4dv_instance()
    # query = "create a barchart showing average gross across genres"

    # # Execute the query
    # output = nl4dv_instance.analyze_query(query)

    # # Print the output
    # print(output)
