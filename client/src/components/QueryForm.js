import { useState } from 'react';
import QuerySearchBar from './QuerySearchBar';

const QueryForm = ({
  loading,
  availableQueries,
  currentModel,
  handleUpdateModel,
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

  return (
    <form
      className="flex flex-col gap-3"
      id="query"
      action=""
      onSubmit={formSubmitted}
    >
      <span>
        <label htmlFor="dataset-select">Select dataset: </label>
        <select
          className="dropdown"
          name="dataset"
          id="dataset-select"
          value={currentDataset}
          onChange={handleUpdateDataset}
        >
          <option value="">--Please choose an option--</option>
          {availableDatasets.map((dataset, i) => (
            <option value={dataset} key={i}>
              {dataset}
            </option>
          ))}
        </select>
      </span>
      <span className="flex">
        <QuerySearchBar
          availableQueries={availableQueries}
          currentQuery={currentVizQuery}
          handleUpdateQuery={setCurrentVizQuery}
        />
        <button className="btn-primary" disabled={!currentVizQuery.trim()}>
          Submit Query
        </button>
      </span>
      <span>
        <label htmlFor="model-select">Select a model to use: </label>
        <select
          className="dropdown"
          name="model"
          id="model-select"
          onChange={(e) => console.log(e)}
        >
          <option value="">--Please choose an option--</option>
          <option value="nl4dv">nl4dv</option>
          <option value="ncNet">ncNet</option>
        </select>
      </span>
    </form>
  );
};

export default QueryForm;
