import { useEffect, useState } from 'react';
import axios from 'axios';
import QueryForm from '../components/QueryForm';
import Dashboard from '../components/Dashboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const temp_saved_response = {
  content: '<p>Hello, World!</p>',
  query: 'create a barchart showing average gross across genres',
  response: {
    alias: null,
    attributeMap: {
      Genre: {
        ambiguity: [],
        inferenceType: 'explicit',
        isAmbiguous: false,
        name: 'Genre',
        queryPhrase: ['genres'],
      },
      'Worldwide Gross': {
        ambiguity: [],
        inferenceType: 'explicit',
        isAmbiguous: false,
        name: 'Worldwide Gross',
        queryPhrase: ['gross'],
      },
    },
    contextObj: null,
    dataset: '.\\assets\\data\\movies-w-year.csv',
    followUpQuery: false,
    query: 'create a barchart showing average gross across genres',
    query_raw: 'create a barchart showing average gross across genres',
    taskMap: {
      derived_value: [
        {
          attributes: ['Worldwide Gross'],
          inferenceType: 'explicit',
          operator: 'AVG',
          queryPhrase: 'average',
          task: 'derived_value',
          values: [],
        },
      ],
    },
    visList: [
      {
        attributes: ['Worldwide Gross', 'Genre'],
        inferenceType: 'explicit',
        queryPhrase: 'barchart',
        tasks: ['derived_value'],
        visType: 'barchart',
        vlSpec: {
          $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
          data: {
            format: {
              type: 'csv',
            },
            url: 'http://localhost:5000/data/movies-w-year.csv',
          },
          encoding: {
            x: {
              aggregate: null,
              field: 'Genre',
              type: 'nominal',
            },
            y: {
              aggregate: 'mean',
              axis: {
                format: 's',
              },
              field: 'Worldwide Gross',
              type: 'quantitative',
            },
          },
          mark: {
            tooltip: true,
            type: 'bar',
          },
          transform: [],
        },
      },
    ],
  },
};

const SERVER_URL = 'http://localhost:5000';

export default function Home() {
  const [vizQuery, setVizQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [availableQueries, setAvailableQueries] = useState([]);
  const [availableDatasets, setAvailableDatasets] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [loadingViz, setLoadingViz] = useState(false);
  const [nlVizData, setNlVizData] = useState(null);
  const [benchmarkVizData, setBenchmarkVizData] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${SERVER_URL}/api/datasets`),
      axios.get(`${SERVER_URL}/api/models`),
    ])
      .then(([datasets, models]) => {
        setAvailableDatasets(datasets.data.response);
        setAvailableModels(models.data.response);
        setLoading(false);
      })
      .catch((err) => toast.error(err));
  }, []);

  const handleChangeDataset = (newDataset) => {
    setLoading(true);
    axios
      .post(`${SERVER_URL}/api/dataset?${document.cookie}`, {
        dataset: newDataset,
      })
      .then((res) => {
        console.log(res.data.message);
        const dataset = res.data.response;
        setSelectedDataset(dataset);
        toast.success(res.data.message);
        axios
          .get(`${SERVER_URL}/api/benchmark/${dataset}/queries`)
          .then((res) => {
            const newAvailableQueries = res.data.response;
            console.log(newAvailableQueries);
            if (!newAvailableQueries.length) {
              toast.warn('No queries available for this dataset.');
            }
            setAvailableQueries(res.data.response);
            setLoading(false);
          });
      })
      .catch((err) => {
        toast.error(`Error: ${err.response.data.message}`);
      });
  };

  const handleChangeModel = (newModel) => {
    axios
      .post(`${SERVER_URL}/api/model?${document.cookie}`, { model: newModel })
      .then((res) => {
        const model = res.data.response;
        setSelectedModel(model);
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(`Error: ${err.response.data.message}`);
      });
  };

  const handleSubmit = (submittedQuery) => {
    setLoadingViz(true);
    console.log('Submitting!');
    if (availableQueries.includes(submittedQuery)) {
      axios
        .get(
          `${SERVER_URL}/api/benchmark/execute?query=${submittedQuery}&${document.cookie}`,
        )
        .then((res) => {
          setNlVizData(res.data.response.model_result);
          setBenchmarkVizData(res.data.response.benchmark);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => setLoadingViz(false));
      return;
    }
    axios
      .get(
        `${SERVER_URL}/api/execute?query=${submittedQuery}&${document.cookie}`,
      )
      .then((res) => {
        setNlVizData(res.data.response);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoadingViz(false));
  };

  return (
    <div className="flex justify-center items-center flex-col gap-2 p-2">
      <h1 className="text-gray-200 p-2 text-5xl">
        Natural Language to Visualization Survey and Benchmarks
      </h1>
      <p className="text-gray-100 ">
        This is a website that serves as an end-to-end system for benchmarking
        natural language to visualization systems.
      </p>

      <span className="mt-10">
        <QueryForm
          handleSubmit={handleSubmit}
          availableQueries={availableQueries}
          currentDataset={selectedDataset}
          availableDatasets={availableDatasets}
          handleUpdateDataset={handleChangeDataset}
          currentModel={selectedModel}
          availableModels={availableModels}
          handleUpdateModel={handleChangeModel}
          loading={loading}
        />
      </span>

      <span className="flex items-end gap-2">
        <div className="mt-10 flex justify-center flex-col text-center">
          {nlVizData && !loadingViz ? (
            <>
              <h3 className="text-xl">Current visualization query:</h3>
              <p className="text-gray-200">"{nlVizData.query}"</p>
            </>
          ) : (
            <h3 className="text-xl">
              {loadingViz
                ? 'Generating visualization(s)...'
                : 'Enter a query above to get started.'}
            </h3>
          )}
        </div>
      </span>
      {/* Show the submitted query */}

      <Dashboard
        nlVizData={nlVizData}
        benchmarkVizData={benchmarkVizData}
        loadingViz={loadingViz}
      />
      <ToastContainer theme="dark" />
    </div>
  );
}
