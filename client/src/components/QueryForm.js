import { useState } from 'react';
import QuerySearchBar from './QuerySearchBar';

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
    e.preventDefault();
    handleUpdateDataset(e.target.value);
  };

  const newModelSelected = (e) => {
    e.preventDefault();
    handleUpdateModel(e.target.value);
  };

  return (
    <form
      className="flex flex-col w-screen max-w-screen-md gap-5 bg-slate-900 p-6 rounded-md shadow-md shadow-gray-800"
      id="query"
      action=""
      onSubmit={(e) => e.preventDefault()}
    >
      {/* <label htmlFor="query" className="text-gray-200 text-left">
          Enter a sentence of what you want to vizualize.
        </label> */}
      <span className="flex">
        <QuerySearchBar
          availableQueries={availableQueries}
          currentQuery={currentVizQuery}
          handleUpdateQuery={setCurrentVizQuery}
        />
        <button
          className="btn-primary min-w-fit"
          type="submit"
          disabled={
            !currentVizQuery.trim() ||
            loading ||
            !currentModel ||
            !currentDataset
          }
          onClick={formSubmitted}
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
            defaultValue={'nl4dv'}
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
