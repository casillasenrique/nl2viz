from nl4dv import NL4DV
import os


DATA_PATH = os.path.join("server", "assets", "data")


def get_nl4dv_instance():

    # Initialize an instance of NL4DV
    # ToDo: verify the path to the source data file. modify accordingly.
    nl4dv_instance = NL4DV(
        data_url=os.path.join(DATA_PATH, "cinema.csv"),
    )

    # using Stanford Core NLP
    # ToDo: verify the paths to the jars. modify accordingly.
    dependency_parser_config = {
        "name": "corenlp",
        "model": os.path.join(
            "server",
            "assets",
            "server-jars",
            "stanford-english-corenlp-2018-10-05-models.jar",
        ),
        "parser": os.path.join(
            "server",
            "assets",
            "server-jars",
            "stanford-parser.jar",
        ),
    }

    # using Stanford CoreNLPServer
    # ToDo: verify the URL to the CoreNLPServer. modify accordingly.
    # dependency_parser_config = {"name": "corenlp-server", "url": "http://localhost:9000"}

    # using Spacy
    # ToDo: ensure that the below spacy model is installed. if using another model, modify accordingly.
    # dependency_parser_config = {"name": "spacy", "model": "en_core_web_sm", "parser": None}

    # Set the Dependency Parser
    nl4dv_instance.set_dependency_parser(config=dependency_parser_config)

    return nl4dv_instance


def switch_dataset(nl2dv_instance: NL4DV, dataset_name, is_benchmark=False):
    # Switch the dataset
    if is_benchmark:
        nl4dv_instance.set_data(
            data_url=os.path.join(
                os.path.join("server", "assets", "benchmark", "data"), dataset_name
            )
        )
        return nl4dv_instance

    nl4dv_instance.set_data(data_url=os.path.join(DATA_PATH, dataset_name))
    return nl4dv_instance


if __name__ == "__main__":
    # Simple test
    nl4dv_instance = get_nl4dv_instance()
    query = "create a barchart showing average gross across genres"

    # Execute the query
    output = nl4dv_instance.analyze_query(query)

    # Print the output
    print(output)
