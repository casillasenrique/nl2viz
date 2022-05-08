from nl4dv import NL4DV
import os

print(__file__)
DATA_PATH = os.path.join("server", "benchmark", "data")
MODELS_PATH = os.path.join("server", "models")


def get_nl4dv_instance(data_path=os.path.join(DATA_PATH, "cinema.csv")):
    nl4dv_instance = NL4DV(data_url=data_path)

    # using Spacy
    # ToDo: ensure that the below spacy model is installed. if using another model, modify accordingly.
    dependency_parser_config = {
        "name": "spacy",
        "model": "en_core_web_sm",
        "parser": None,
    }

    # Set the Dependency Parser
    nl4dv_instance.set_dependency_parser(config=dependency_parser_config)

    return nl4dv_instance


def get_ncNetInstance(data_path=os.path.join(DATA_PATH, "cinema.csv"), table_name='cinema'):
    from .models.ncNet.ncNet import ncNet

    trained_ncNet_model_path = os.path.join(
        MODELS_PATH, "ncNet", "save_models", "trained_model.pt"
    )
    ncNetInstance = ncNet(trained_model=trained_ncNet_model_path)
    ncNetInstance.specify_dataset(
        data_type="csv",
        table_name=table_name,
        data_url=data_path,
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
