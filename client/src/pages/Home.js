import { useEffect, useState } from 'react';
import axios from 'axios';
import QueryForm from '../components/QueryForm';
import Dashboard from '../components/Dashboard';

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
  const [selectedModel, setSelectedModel] = useState(
    '--Please choose an option--',
  );
  const [selectedDataset, setSelectedDataset] = useState(
    '--Please choose an option--',
  );
  const [availableQueries, setAvailableQueries] = useState([]);
  const [availableDatasets, setAvailableDatasets] = useState([]);
  const [loadingViz, setLoadingViz] = useState(false);
  const [nlVizData, setNlVizData] = useState(null);

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/api/datasets`)
      .then((res) => {
        const datasets = res.data.response;
        setAvailableDatasets(res.data.response);
        axios
          .get(`${SERVER_URL}/api/benchmark/${"cinema"}/queries`)
          .then((res) => {
            setAvailableQueries(res.data.response);
            setLoading(false);
          });
      })
      .catch((err) => console.error(err));
  }, []);

  const handleChangeDataset = (e) => {
    const newDataset = e.target.value;
    setLoading(true);
    axios
      .post(`${SERVER_URL}/api/dataset`, { dataset: newDataset })
      .then((res) => {
        console.log(res.data.message);
        const dataset = res.data.response;
        setSelectedDataset(dataset);
        axios
          .get(`${SERVER_URL}/api/benchmark/${dataset}/queries`)
          .then((res) => {
            setAvailableQueries(res.data.response);
            setLoading(false);
          });
      })
      .catch((err) => console.error(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting!');
    setLoadingViz(true);
    axios
      .get(`${SERVER_URL}/api/execute?query=${vizQuery}`)
      .then((res) => {
        setNlVizData(res.data.response);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoadingViz(false));
    setVizQuery('');
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
        <label htmlFor="query" className="text-gray-200 text-lg">
          Enter what you want to vizualize.
        </label>

        <QueryForm
          handleSubmit={handleSubmit}
          currentQuery={vizQuery}
          availableQueries={availableQueries}
          handleUpdateQuery={setVizQuery}
          currentDataset={selectedDataset}
          availableDatasets={availableDatasets}
          handleUpdateDataset={handleChangeDataset}
          currentModel={selectedModel}
          handleUpdateModel={setSelectedModel}
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

      <Dashboard nlVizData={nlVizData} loadingViz={loadingViz} />
    </div>
  );
}
