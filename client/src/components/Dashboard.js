import { memo, useEffect, useState } from 'react';
import Loader from './Loader';
import { Vega, VegaLite } from 'react-vega';

const Dashboard = ({
  nlVizData,
  loadingViz,
  benchmarkVizData,
  handleSubmitQuery,
  noQueryYet,
}) => {
  const [vizIndex, setVizIndex] = useState(0);

  useEffect(() => {
    console.log('refreshing');
    setVizIndex(0);
  }, [nlVizData]);

  const showTitle = () => {
    if (noQueryYet && !loadingViz) {
      return (
        <h3 className="text-xl">
          <b>Enter a query above to get started.</b>
        </h3>
      );
    }
    if (loadingViz) {
      return (
        <h3 className="text-lg">
          <i>Loading visualization...</i>
        </h3>
      );
    }
    return (
      <div className="flex flex-col gap-3">
        <h3 className="flex gap-2 text-gray-200 text-lg">
          <b>Showing:</b>
          <p
            className="hover:text-yellow-500 hover:cursor-pointer transition-colors"
            onClick={() => handleSubmitQuery(nlVizData.query)}
          >
            "{nlVizData.query}"
          </p>
        </h3>
        {benchmarkVizData?.length > 0 && (
          <div>
            <h3 className="text-gray-400">
              <b>Equivalent queries:</b>
            </h3>
            <ol className="text-gray-400">
              {benchmarkVizData[0].nl_queries
                .filter((q) => {
                  console.log(q);
                  return q.toLowerCase() !== nlVizData.query_raw.toLowerCase();
                })
                .map((q) => (
                  <li
                    key={q}
                    className="w-fit hover:text-yellow-500 hover:cursor-pointer transition-colors"
                    onClick={() => handleSubmitQuery(q)}
                  >
                    "{q}"
                  </li>
                ))}
            </ol>
          </div>
        )}
      </div>
    );
  };

  const showModelViz = () => {
    if (loadingViz) {
      return <Loader />;
    }

    if (noQueryYet) {
      return <></>
    }

    if (!nlVizData?.visList.length) {
      return (
        <h3 className="text-gray-200 text-lg">
          <b>The model did not produce a visualization!</b>
        </h3>
      );
    }

    return (
      <VegaLite
        spec={{
          ...nlVizData.visList[vizIndex].vlSpec,
          resize: true,
          autosize: 'fit',
          width: 500,
          height: 400,
          background: '#fafafa',
        }}
        actions={{
          export: true,
          source: false,
          compiled: false,
          editor: true,
        }}
        downloadFileName={'Just Name It'}
      />
    );
  };

  const showBenchmarkViz = () => {
    if (loadingViz) {
      return <Loader />;
    }

    if (noQueryYet) {
      return <></>
    }

    if (!benchmarkVizData?.length) {
      return (
        <h3 className="text-gray-200 text-lg">
          <b>Could not find a benchmark associated with this NL query</b>
        </h3>
      );
    }

    return (
      <VegaLite
        spec={{
          ...benchmarkVizData[0].vega_spec,
          autosize: 'fit',
          width: 500,
          height: 400,
          background: '#fafafa',
        }}
        actions={{
          export: true,
          source: false,
          compiled: false,
          editor: true,
        }}
        downloadFileName={'Just Name It'}
      />
    );
  };

  return (
    <span className="max-h-screen flex w-full justify-between bg-slate-900">
      <div className="Dashboard-left relative p-1 rounded-sm w-1/6 resize-x text-left bg-gray-800">
        <h2 className="absolute backdrop-blur-md  text-gray-400">
          <code>Raw model output</code>
        </h2>
        <pre id="json" className="h-full overflow-y-scroll">
          {nlVizData && !loadingViz && (
            <code> {JSON.stringify(nlVizData, null, 4)}</code>
          )}
        </pre>
      </div>
      <div className="Dashboard-center text-left w-2/3 flex flex-col gap-2">
        <div className="my-5 px-3">{showTitle()}</div>
        <div className="Dashboard-visualizations bg-slate-800 rounded-md flex">
          <div className="Dashboard-model-viz p-2 flex flex-col gap-1 w-1/2">
            <h2 className="text-gray-400 text-center">
              <code>Model Output</code>
            </h2>
            <div className="h-[500px] flex justify-center items-center border-2 border-gray-700 rounded-md">
              {showModelViz()}
            </div>
          </div>
          <div className="Dashboard-benchmark-viz p-2 flex flex-col gap-1 w-1/2">
            <h2 className="text-gray-400 text-center">
              <code>Benchmark Output</code>
            </h2>
            <div className="h-[500px] p-2 flex justify-center items-center border-2 border-gray-700 rounded-md">
              {showBenchmarkViz()}
            </div>
          </div>
        </div>
        {nlVizData?.visList.length > 0 && (
          <span className="w-1/2 flex gap-5 justify-center items-center">
            <button
              disabled={vizIndex <= 0}
              onClick={() => setVizIndex(vizIndex - 1)}
              className="btn-primary"
            >
              Previous visualization
            </button>
            <label className="text-lg text-gray-300">
              {vizIndex + 1}/{nlVizData.visList.length || 0}
            </label>
            <button
              disabled={vizIndex >= nlVizData.visList.length - 1}
              onClick={() => setVizIndex(vizIndex + 1)}
              className="btn-primary"
            >
              Next visualization
            </button>
          </span>
        )}
      </div>
      <div className="Dashboard-right p-3 w-1/6 text-left text-gray-300 flex flex-col gap-3">
        <div>
          <h2 className="text-lg text-gray-200">Visualization info:</h2>
          {nlVizData && !loadingViz && (
            <ul>
              <li>
                Model name: <code className="text-gray-200">{'TODO'}</code>
              </li>
              <li>
                Visualization Count:{' '}
                <code className="text-gray-200">
                  {nlVizData.visList.length}
                </code>
              </li>
              <li>
                Attributes shown:{' '}
                <code className="text-gray-200">
                  {nlVizData.visList[vizIndex]?.attributes?.join(', ') ||
                    'None provided'}
                </code>
              </li>
              <li>
                Associated benchmarks:{' '}
                <code className="text-gray-200">{benchmarkVizData.length}</code>
              </li>
            </ul>
          )}
        </div>
        <pre
          id="json"
          className="rounded-md h-full overflow-y-scroll bg-gray-800"
        >
          <h2 className="absolute backdrop-blur-md ml-2 pt-1 text-gray-400">
            <code>Raw benchmark output</code>
          </h2>
          {benchmarkVizData && !loadingViz && (
            <code> {JSON.stringify(benchmarkVizData, null, 4)}</code>
          )}
        </pre>
      </div>
    </span>
  );
};

const MemoizedSubComponent = memo(Dashboard);

export default MemoizedSubComponent;
