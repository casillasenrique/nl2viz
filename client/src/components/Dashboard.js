import { memo, useEffect, useState } from 'react';
import Loader from './Loader';
import { Vega, VegaLite } from 'react-vega';

const Dashboard = ({ nlVizData, loadingViz, benchmarkVizData }) => {
  const [vizIndex, setVizIndex] = useState(0);

  useEffect(() => {
    console.log('refreshing');
    setVizIndex(0);
  }, [nlVizData]);

  const getTitle = () => {
    if (!nlVizData && !loadingViz) {
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
        <h3 className="text-gray-200 text-lg">
        <b>Showing: </b>"{nlVizData.query}"
        </h3>
        {benchmarkVizData && (
          <div className='text-left'>
            <h3 className="text-gray-400"><b>Related queries:</b></h3>
            <ol className="text-gray-400">
              {benchmarkVizData[0].nl_queries
                .filter((q) => {
                  console.log(q);
                  return q.toLowerCase() !== nlVizData.query_raw.toLowerCase();
                })
                .map((q) => (
                  <li key={q}>
                    <a href={`/\?query=${q}`}>"{q}"</a>
                  </li>
                ))}
            </ol>
          </div>
        )}
      </div>
    );
  };

  return (
    <span className="flex w-full justify-between bg-slate-900">
      <div className="Dashboard-left w-1/6 resize-x p-1 mr-5 text-left overflow-x-scroll bg-gray-800">
        <pre id="json">
          {nlVizData && !loadingViz ? (
            <code> {JSON.stringify(nlVizData, null, 4)}</code>
          ) : (
            <code>No data</code>
          )}
        </pre>
      </div>
      <div className="Dashboard-center w-2/3 flex flex-col gap-2">
        <div className='my-5'>
        {getTitle()}
        </div>
        <div className="sticky bg-black top-3 flex w-full h-[500px] justify-center">
          {loadingViz && <Loader />}
          {nlVizData?.visList.length && !loadingViz && (
            <div className="flex flex-col justify-start items-center gap-5">
              <VegaLite
                spec={{
                  ...nlVizData.visList[vizIndex].vlSpec,
                  resize: true,
                  contains: 'padding',
                  width: 500,
                  height: 500,
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
              <span className="flex gap-5 items-center">
                <button
                  disabled={vizIndex <= 0}
                  onClick={() => setVizIndex(vizIndex - 1)}
                  className="btn-primary"
                >
                  Previous visualization
                </button>
                <label>{vizIndex + 1}</label>
                <button
                  disabled={vizIndex >= nlVizData.visList.length - 1}
                  onClick={() => setVizIndex(vizIndex + 1)}
                  className="btn-primary"
                >
                  Next visualization
                </button>
              </span>
            </div>
          )}
          {benchmarkVizData && !loadingViz && (
            <div className="flex flex-col justify-start items-center gap-5">
              <VegaLite
                spec={{
                  ...benchmarkVizData[0].vega_spec,
                  resize: true,
                  contains: 'padding',
                  width: 500,
                  height: 500,
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
              <span className="flex gap-5 items-center">
                {/* <button
                disabled={vizIndex <= 0}
                onClick={() => setVizIndex(vizIndex - 1)}
                className="btn-primary"
              >
                Previous visualization
              </button> */}
                <h2 className="text-2xl">BENCHMARK</h2>
                {/* <button
                disabled={vizIndex >= nlVizData.visList.length - 1}
                onClick={() => setVizIndex(vizIndex + 1)}
                className="btn-primary"
              >
                Next visualization
              </button> */}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="Dashboard-right w-1/6 text-left">
        <h2 className="text-xl">Visualization info:</h2>
        {nlVizData && !loadingViz && (
          <ul>
            <li>
              <b>Number of visualizations:</b> {nlVizData.visList.length}
            </li>
            <li>
              <b> Attributes shown: </b>
              {nlVizData.visList[vizIndex]?.attributes.join(', ')}
            </li>
          </ul>
        )}
      </div>
    </span>
  );
};

const MemoizedSubComponent = memo(Dashboard);

export default MemoizedSubComponent;
