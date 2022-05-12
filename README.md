# Benchmarking Natural Language to Visualization Models

## Abstract
This project serves as a tool to test the quality of Natural Language to
Visualization (NL2Viz) models based on existing benchmarks. Read the project
report
[here](assets/Benchmarking%20Natural%20Language%20to%20Data%20Visualization%20Models.pdf).
View the final presentation
[here](assets/presentation/NL2Viz%20Presentation.pdf). The project was for
6.S079 in the Spring 2022 semester.

## Project Overview
The app uses a React front-end (bootstrapped with
[`create-react-app`](https://create-react-app.dev/)) and a Python backend using
the [`Flask`](https://flask.palletsprojects.com) web framework. The benchmark is
provided by `nvBench` \[[1](#1-nvbench-benchmark)\], which gives a list of
$(query, viz)$ pairs. The following NL2Viz models are supported on the server:

* `ncNet` \[[2](#2-ncnet-model)\]  
* `nl4dv` \[[3](#3-nl4dv-model)\] 

The tool is deployed at https://nl2viz.herokuapp.com/. Due to the
resource-intensive nature of these models, however, it is highly likely that the
application crashes several times. Use at your own risk!
### Structure
A high-level overview of the project structure is shown below.

```
📦final-project
 ┣ 📂client
 ┃ ┣ 📂public
 ┃ ┣ 📂src
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┗ 📂pages
 ┣ 📂server
 ┃ ┣ 📂benchmark
 ┃ ┃ ┣ 📂data
 ┃ ┃ ┗ 📜benchmark_meta.json
 ┃ ┣ 📂models
 ┃ ┃ ┣ 📂ncNet
 ┃ ┃ ┗ 📂nl4dv
 ┃ ┣ 📂scripts
 ┃ ┃ ┣ 📜config.py
 ┃ ┃ ┣ 📜get_benchmark_meta.py
 ┃ ┃ ┗ 📜sqlite_to_csv.py
 ┃ ┣ 📜api.py
 ┃ ┗ 📜model_setup.py
 ┣ 📜app.py
 ┣ 📜nltk.txt
 ┣ 📜requirements.txt
 ┗ 📜runtime.txt
```

This project is separated into a client directory and a server directory. The
client handles user interaction, while the server handles the actual data
processing and keeps track of the Nl2Viz model instances. 

The [`app.py`](app.py) file is the entry point for the server, while
[`client/src/index.js`] is the entry point for the client, as is standard for
React apps.

### Datasets
The datasets available in this tool are found [here](server/benchmark/data/).
Note that the only datasets that exist in this directory are those that have an
associated benchmark. Some benchmarks require more than one dataset to be used
in order to produce the final result; these benchmarks are excluded in this
tool. Therefore the datasets that are never used by a benchmark are also not
included.

## Local Use/Development
Follow the steps below to get started:

1. Clone the repository into your local workspace.
2. Set up a virtual environment with Python version no greater than `3.9`. This
   is required for the models to work, since they both use older versions of
   libraries that have been depracated in the newer versions of Python.
3. Start the virtual environment.
4. Install the dependencies in your virtual environment by running `pip install -r requirements.txt`. **NOTE**: [`requirements.txt`](requirements.txt)
   installs the CPU version of [`pytorch`](https://pytorch.org/). This is
   necessary for the production environment, but may yield slower processing
   times in development. If you are planning on doing a lot of development, also
   make sure to install the GPU version by installing the requirements in
   [`dev-requirements.txt`](dev-requirements.txt). This requirements
   file also contains modules required to perform evaluation, such as
   [`Dask`](https://distributed.dask.org/en/stable/quickstart.html) and
   [`scikit-image`](https://scikit-image.org/). If you do choose to re-run
   evaluation, also make sure to install the node modules by running `npm i` in
   the project root directory. 
5. For the `nl4dv` model to work, install the following dependencies separately
  (see the `nl4dv`
  [documentation](https://nl4dv.github.io/nl4dv/documentation.html) for more
  details.):
    - `python -m nltk.downloader popular`
    - `python -m spacy download en_core_web_sm`

6. In the root directory, run `flask run` to start the server. To start it in
   development mode, create a `.flaskenv` file in the root directory and add
   `FLASK_ENV=development`. The server is served at http://localhost:5000 by default.
7. Navigate to the [`client/`](client/) directory and run `npm i` to install the
   dependencies for the React frontend.
8. Still in `client/` run `npm start` to start the client, served at
   http://localhost:3000.
9. For full access to all of the features, still in `client/`, run `npm run
   build` to build the latest version of the frontend. Then, instead of needing
   to start the client, simply start the server and navigate to
   http://localhost:5000 which serves the static buildpack. 


## References

#### 1. `nvBench` (Benchmark)
   * **Authors:** Yuyu Luo, Nan Tang, Guoliang Li, Chengliang Chai, Wenbo Li,
  and Xuedi Qin
   * [Github](https://github.com/TsinghuaDatabaseGroup/nvBench)
   * [Paper](https://dl.acm.org/doi/abs/10.1145/3448016.3457261)

#### 2. `ncNet` (Model)
  * **Authors:** Yuyu Luo, Nan Tang, Guoliang Li, Jiawei Tang, Chengliang Chai,
  and Xuedi Qin
  * [Github](https://github.com/Thanksyy/ncNet)
  * [Paper](https://luoyuyu.vip/files/ncNet-VIS21.pdf)  
#### 3. `nl4dv` (Model)
  * **Authors:** Arpit Narechania, Arjun Srinivasan, and John Stasko
  * [Github](https://github.com/nl4dv/nl4dv)
  * [Paper](https://www.cc.gatech.edu/~anarechania3/docs/publications/nl4dv_vis_2020.pdf)