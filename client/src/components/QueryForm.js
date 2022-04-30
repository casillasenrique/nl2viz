import { useState } from 'react';

const QueryForm = ({
  loading,
  availableQueries,
  currentModel,
  handleUpdateModel,
  availableModels,
  currentDataset,
  availableDatasets,
  handleUpdateDataset,
  handleSubmit,
}) => {
  const [currentVizQuery, setCurrentVizQuery] = useState('');

  const formSubmitted = (e) => {
    e.preventDefault();
    handleSubmit(currentVizQuery);
    setCurrentVizQuery('');
  };

  const newDatasetSelected = (e) => {
    // e.preventDefault();
    handleUpdateDataset(e.target.value);
  };

  const newModelSelected = (e) => {
    // e.preventDefault();
    handleUpdateModel(e.target.value);
  };

  return (
    <form
      className="flex flex-col w-screen max-w-screen-md gap-5 bg-slate-900 p-6 rounded-md shadow-md shadow-gray-800"
      id="query"
      action=""
      onSubmit={formSubmitted}
    >
      <span className="flex items-end">
        <input
          className="w-full h-full pb-1 pr-1 mr-1 bg-transparent border-b-2 border-yellow-500  focus:border-gray-100 focus:outline-none transition-colors duration-300 placeholder:text-gray-500"
          type="text"
          name="Vizualization query"
          value={currentVizQuery}
          // Timeout since we need to wait for the button to be pressed
          placeholder="Enter a sentence of what you want to vizualize"
          id="query-choice"
          list="available-queries"
          onChange={(e) => setCurrentVizQuery(e.target.value)}
        />
        <datalist id="available-queries" className="bg-slate-50 text-ellipsis">
          {availableQueries.map((query, i) => (
            <option key={`${i}${query}`} value={query}>
              {query}
            </option>
          ))}
        </datalist>
        <button
          className="btn-primary min-w-fit"
          type="submit"
          disabled={
            !currentVizQuery.trim() ||
            loading ||
            !currentModel ||
            !currentDataset
          }
        >
          Submit Query
        </button>
      </span>
      <span className="flex justify-between">
        <span className="flex items-center gap-2">
          <label htmlFor="model-select" className="font-bold">
            Nl2Viz Model
          </label>
          <select
            className="dropdown"
            name="model"
            id="model-select"
            form={'query'}
            value={currentModel}
            onChange={newModelSelected}
          >
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </span>
        <span className="flex items-center gap-2">
          <label htmlFor="dataset-select" className="font-bold">
            Dataset
          </label>
          <select
            className="dropdown"
            name="dataset"
            id="dataset-select"
            value={currentDataset}
            onChange={newDatasetSelected}
          >
            {availableDatasets.map((dataset, i) => (
              <option value={dataset} key={i}>
                {dataset}
              </option>
            ))}
          </select>
        </span>
      </span>
    </form>
  );
};

export default QueryForm;
