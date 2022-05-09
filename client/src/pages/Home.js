import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import QueryForm from '../components/QueryForm';
import Dashboard from '../components/Dashboard';
import Loader from '../components/Loader';
import axios from 'axios';
import githubLogo from '../images/github-logo.png';
import 'react-toastify/dist/ReactToastify.css';

export default function Home({ version, serverUrl }) {
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [availableQueries, setAvailableQueries] = useState([]);
  const [availableDatasets, setAvailableDatasets] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [loadingViz, setLoadingViz] = useState(false);
  const [nlVizData, setNlVizData] = useState(null);
  const [benchmarkVizData, setBenchmarkVizData] = useState(null);
  const [noQueryYet, setNoQueryYet] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${serverUrl}/api/datasets`), // All datasets
      axios.get(`${serverUrl}/api/models`), // All models
      axios.get(`${serverUrl}/api/model?${document.cookie}`),
    ])
      .then(([datasetsRes, modelsRes, currentModelRes]) => {
        const [datasets, models, currentModel] = [
          datasetsRes.data.response,
          modelsRes.data.response,
          currentModelRes.data.response,
        ];
        datasets.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        setAvailableDatasets(datasets);
        setAvailableModels(models);

        if (currentModel) {
          setSelectedModel(currentModel);
        }

        // Then fetch the dataset to try to avoid concurrency issues
        axios
          .get(`${serverUrl}/api/dataset?${document.cookie}`)
          .then((res) => {
            const currentDataset = res.data.response;
            if (currentDataset) {
              fetchAvailableQueries(currentDataset)
                .then((queries) => {
                  setSelectedDataset(currentDataset);
                  setAvailableQueries(queries);
                })
                .catch((err) => {
                  toast.error(err.response.data.message);
                });
            }
          })
          .catch((err) => {
            toast.error(err.response.data.message);
          });
      })
      .catch((err) => toast.error(err))
      .finally(() => setLoading(false));
  }, []);

  const fetchAvailableQueries = async (dataset) => {
    return axios
      .get(`${serverUrl}/api/benchmark/${dataset}/queries`)
      .then((res) => res.data.response)
      .catch((err) => toast.error(err));
  };

  const handleChangeDataset = (newDataset) => {
    setLoading(true);
    axios
      .post(`${serverUrl}/api/dataset?${document.cookie}`, {
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
        });
      })
      .catch((err) => {
        toast.error(`Error: ${err.response.data.message}`);
      })
      .finally(() => setLoading(false));
  };

  const handleChangeModel = (newModel) => {
    setLoading(true);
    axios
      .post(`${serverUrl}/api/model?${document.cookie}`, { model: newModel })
      .then((res) => {
        const model = res.data.response;
        setSelectedModel(model);
        toast.success(res.data.message);
      })
      .catch((err) => {
        console.error(err);
        toast.error(`Error: ${err.response.data.message}`);
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = (submittedQuery) => {
    setLoadingViz(true);
    console.log('Submitting!');
    if (availableQueries.includes(submittedQuery)) {
      axios
        .get(
          `${serverUrl}/api/benchmark/execute?query=${submittedQuery}&${document.cookie}`,
        )
        .then((res) => {
          setNlVizData(res.data.response.model_result);
          console.log(res.data.response.benchmark);
          setBenchmarkVizData(res.data.response.benchmark);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          console.log('done!');
          setLoadingViz(false);
          setNoQueryYet(false);
        });
      return;
    }
    axios
      .get(
        `${serverUrl}/api/execute?query=${submittedQuery}&${document.cookie}`,
      )
      .then((res) => {
        setNlVizData(res.data.response);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoadingViz(false);
        setNoQueryYet(false);
      });
  };

  return (
    <div className="flex justify-center items-center flex-col gap-2 p-2">
      <h1 className="text-gray-200 p-2 text-4xl mb-3">
        Natural Language to Visualization Benchmarks
      </h1>

      <span className="flex w-full">
        <div className="w-1/5 p-2">
          <p className="text-gray-300 text-left text-sm outline-dashed outline-1 outline-gray-500 p-3 rounded">
            This website serves as a tool to visualize natural language to
            visualization models compared to a benchmark. Visit the{' '}
            <a
              className="hover:text-yellow-500 transition-colors"
              href="https://github.com/casillasenrique/nl2viz"
              target="_blank"
            >
              GitHub page
            </a>{' '}
            for more details.
          </p>
        </div>
        <div className="w-4/5 flex justify-center relative">
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
            <div className="absolute left-2 top-3 w-60">
              <Loader />
            </div>
          )}
        </div>
        <div className="flex w-1/5 justify-end items-start p-2">
          <a
            className="flex gap-2 items-center w-fit text-gray-200 hover:text-gray-50 transition-colors"
            href="https://github.com/casillasenrique/nl2viz"
            target="_blank"
          >
            <img
              className="rounded-full w-5 border-2"
              src={githubLogo}
              alt="GitHub Logo"
            />
            <p>v{version}</p>
          </a>
        </div>
      </span>

      {/* Show the submitted query */}

      <Dashboard
        nlVizData={nlVizData}
        benchmarkVizData={benchmarkVizData}
        loadingViz={loadingViz}
        handleSubmitQuery={handleSubmit}
        noQueryYet={noQueryYet}
        model={selectedModel}
      />
      <ToastContainer theme="dark" />
    </div>
  );
}
