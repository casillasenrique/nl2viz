import { memo, useEffect, useState } from 'react';
import Loader from './Loader';
import { Vega, VegaLite } from 'react-vega';

const Dashboard = ({ nlVizData, loadingViz }) => {
  const [vizIndex, setVizIndex] = useState(0);

  useEffect(() => {
    console.log('refreshing')
    setVizIndex(0);
  }, [nlVizData]);

  return (
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
            <VegaLite
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
