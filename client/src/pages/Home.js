import { useState } from 'react';
import { Vega } from 'react-vega';
import axios from 'axios';
import Loader from '../components/Loader';

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
  const [loadingViz, setLoadingViz] = useState(false);
  const [nlVizData, setNlVizData] = useState(null);
  const [vizIndex, setVizIndex] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting!');
    setLoadingViz(true);
    setVizIndex(0);
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

        <form
          className="flex flex-col gap-3"
          id="query"
          action=""
          onSubmit={handleSubmit}
        >
          <span>
            <input
              className="w-96 pb-1 pr-1 mr-1 bg-transparent border-b-2 border-yellow-500  focus:border-gray-100 focus:outline-none transition-colors duration-300"
              type="text"
              name="Vizualization query"
              value={vizQuery}
              id=""
              onChange={(e) => setVizQuery(e.target.value)}
            />

            <button
              className="p-2 rounded-md bg-gradient-to-tr from-yellow-500 bg-yellow-700 hover:bg-yellow-500 hover:scale-105 transition-all disabled:bg-yellow-700 disabled:from-inherit disabled:transform-none disabled:text-gray-400"
              disabled={!vizQuery.trim()}
            >
              Submit Query
            </button>
          </span>
          <span>
            <label htmlFor="model-select">Select a model to use: </label>
            <select
              className="bg-slate-700 py-1 px-2 rounded-md hover:bg-slate-600 transition-colors"
              name="model"
              id="model-select"
            >
              <option value="">--Please choose an option--</option>
              <option value="nl4dv">nl4dv</option>
              <option value="ncNet">ncNet</option>
            </select>
          </span>
        </form>
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

      <span className="flex w-full justify-between">
        <div className="p-1 mr-5 text-left min-w-[400px] w-[1000px] overflow-x-scroll bg-gray-800">
          <pre id="json">
            {nlVizData && !loadingViz ? (
              <code> {JSON.stringify(nlVizData, null, 4)}</code>
            ) : (
              <code>No data</code>
            )}
          </pre>
        </div>

        <div className="sticky top-3 flex w-full h-full justify-center">
          {loadingViz && <Loader />}
          {nlVizData?.visList.length && !loadingViz && (
            <div className="flex flex-col justify-start items-center gap-5">
              <Vega
                spec={{
                  ...nlVizData.visList[vizIndex].vlSpec,
                  autosize: 'fit',
                  resize: true,
                  contains: 'padding',
                  width: 700,
                  height: 500,
                }}
                actions={{
                  export: true,
                  source: false,
                  compiled: false,
                  editor: false,
                }}
                downloadFileName={'Just Name It'}
              />
              <span className="flex gap-5 items-center">
                <button
                  disabled={vizIndex <= 0}
                  onClick={() => setVizIndex(vizIndex - 1)}
                  className="p-2 h-max rounded-md bg-gradient-to-tr from-yellow-500 bg-yellow-700 hover:bg-yellow-500 hover:scale-105 transition-all disabled:bg-yellow-700 disabled:from-inherit disabled:transform-none disabled:text-gray-400"
                >
                  Previous visualization
                </button>
                <label>{vizIndex + 1}</label>
                <button
                  disabled={vizIndex >= nlVizData.visList.length - 1}
                  onClick={() => setVizIndex(vizIndex + 1)}
                  className="p-2 h-max rounded-md bg-gradient-to-tr from-yellow-500 bg-yellow-700 hover:bg-yellow-500 hover:scale-105 transition-all disabled:bg-yellow-700 disabled:from-inherit disabled:transform-none disabled:text-gray-400"
                >
                  Next visualization
                </button>
              </span>
            </div>
          )}
        </div>
        <div className="text-left min-w-[400px] max-w-xl">
          <h2 className="text-xl">Visualization info:</h2>
          {nlVizData && !loadingViz && (
            <ul>
              <li>
                <b>Number of visualizations:</b> {nlVizData.visList.length}
              </li>
              <li>
                <b> Attributes shown: </b>
                {nlVizData.visList[vizIndex].attributes.join(', ')}
              </li>
            </ul>
          )}
        </div>
      </span>
    </div>
  );
}
