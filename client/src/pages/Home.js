import { useEffect, useState } from 'react';
import axios from 'axios';
import QueryForm from '../components/QueryForm';
import Dashboard from '../components/Dashboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../components/Loader';

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
      axios.get(`${SERVER_URL}/api/datasets`), // All datasets
      axios.get(`${SERVER_URL}/api/dataset?${document.cookie}`), // Current dataset
      axios.get(`${SERVER_URL}/api/models`), // All models
      axios.get(`${SERVER_URL}/api/model?${document.cookie}`), // Current model
    ])
      .then(([datasetsRes, currentDatasetRes, modelsRes, currentModelRes]) => {
        const [datasets, currentDataset, models, currentModel] = [
          datasetsRes.data.response,
          currentDatasetRes.data.response,
          modelsRes.data.response,
          currentModelRes.data.response,
        ];
        setAvailableDatasets(datasets);
        setAvailableModels(models);
        setSelectedDataset(currentDataset);
        setSelectedModel(currentModel);

        if (currentDataset) {
          fetchAvailableQueries(currentDataset).then((queries) => {
            setAvailableQueries(queries);
            setLoading(false);
          });
        }
      })
      .catch((err) => toast.error(err));
  }, []);

  const fetchAvailableQueries = async (dataset) => {
    return axios
      .get(`${SERVER_URL}/api/benchmark/${dataset}/queries`)
      .then((res) => res.data.response)
      .catch((err) => toast.error(err));
  };

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
        fetchAvailableQueries(dataset).then((queries) => {
          if (!queries.length) {
            toast.warn('No queries available for this dataset.');
          }
          setAvailableQueries(queries);
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

      <span className="flex relative">
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
        {loading && (
          <div className="absolute -left-16 top-5">
            <Loader />
          </div>
        )}
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
