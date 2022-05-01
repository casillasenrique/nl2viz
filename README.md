# End-to-end Natural Language to Visualization Analysis

## Abstract
This project serves as a tool to test the quality of Natural Language to
Visualization (NL2Viz) models based on existing benchmarks.

## Project Overview
The app uses a React front-end (bootstrapped with `create-react-app`) and a
Python backend using the `Flask` web framework. 
The following NL2Viz models are supported on the server:

* [nl4dv]()
* [ncNet]()

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
 ┃ ┣ 📂assets
 ┃ ┃ ┣ 📂benchmark
 ┃ ┃ ┃ ┣ 📂data
 ┃ ┃ ┃ ┗ 📜benchmark_meta.json
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
The following list of datasets are available in the app, found
[here](server/assets/benchmark/data/). The list is does not cover the entire
benchmark due to space limitations.
```
📂server/assets/benchmark/data
┣ 📜Activity.csv
┣ 📜aircraft.csv
┣ 📜airport.csv
┣ 📜airport_aircraft.csv
┣ 📜Allergy_Type.csv
┣ 📜Apartments.csv
┣ 📜Apartment_Bookings.csv
┣ 📜Apartment_Buildings.csv
┣ 📜Apartment_Facilities.csv
┣ 📜architect.csv
┣ 📜Assets.csv
┣ 📜Asset_Parts.csv
┣ 📜author.csv
┣ 📜bridge.csv
┣ 📜cinema.csv
┣ 📜Engineer_Skills.csv
┣ 📜Engineer_Visits.csv
┣ 📜Faculty.csv
┣ 📜Faculty_Participates_in.csv
┣ 📜Fault_Log.csv
┣ 📜Fault_Log_Parts.csv
┣ 📜film.csv
┣ 📜Guests.csv
┣ 📜Has_Allergy.csv
┣ 📜Maintenance_Contracts.csv
┣ 📜Maintenance_Engineers.csv
┣ 📜match.csv
┣ 📜mill.csv
┣ 📜Participates_in.csv
┣ 📜Parts.csv
┣ 📜Part_Faults.csv
┣ 📜pilot.csv
┣ 📜schedule.csv
┣ 📜Skills.csv
┣ 📜Skills_Required_To_Fix.csv
┣ 📜Staff.csv
┣ 📜Student.csv
┣ 📜Third_Party_Companies.csv
┗ 📜View_Unit_Status.csv
```

## Local Use/Development
Follow the steps below to get started:

1. Clone the repository into your local workspace.
2. Set up a virtual environment with Python version no greater than `3.9`. This
   is required for the models to work, since they both use older versions of
   libraries that have been depracated in the newer versions of Python.
3. Start the virtual environment.
4. Install the dependencies in your virtual environment by running `pip install
   -r requirements.txt`.
5. For the `nl4dv` model to work, install the following dependencies separately
  (see the documentation
  `nl4dv`[documentation](https://nl4dv.github.io/nl4dv/documentation.html) for
  more details.):
    - `python -m nltk.downloader popular`
    - `python -m spacy download en_core_web_sm`

6. In the root directory, run `flask run` to start the server. To start it in
   development mode, create a `.flaskenv` file in the root directory and add
   `FLASK_ENV=development`,
7. Navigate to the `client/` directory and run `npm i` to install the
   dependencies for the React frontend.
8. Still in `client/` run `npm start` to start the client, served at
   http://localhost:3000. 


## References

* nvBench **(Evaluation)**
  * [Github](https://github.com/TsinghuaDatabaseGroup/nvBench)
  * [Paper](https://dl.acm.org/doi/abs/10.1145/3448016.3457261)
* ncNet
  * [Github](https://github.com/Thanksyy/ncNet)
  * [Paper](https://luoyuyu.vip/files/ncNet-VIS21.pdf)  
* nl4dv
  * [Github](https://github.com/nl4dv/nl4dv)
  * [Paper](https://www.cc.gatech.edu/~anarechania3/docs/publications/nl4dv_vis_2020.pdf)
<!-- * DeepEye
  * [Github](https://github.com/Thanksyy/DeepEye-APIs)
  * [Paper](http://dbgroup.cs.tsinghua.edu.cn/ligl/papers/icde18-deepeye.pdf) -->