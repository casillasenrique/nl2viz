import SearchBar from "./SearchBar";

const QueryForm = ({
  currentQuery,
  availableQueries,
  handleUpdateQuery,
  currentModel,
  handleUpdateModel,
  currentDataset,
  availableDatasets,
  handleUpdateDataset,
  handleSubmit,
}) => {

  return (
    <form
      className="flex flex-col gap-3"
      id="query"
      action=""
      onSubmit={handleSubmit}
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
      <span>
        <input
          className="w-96 pb-1 pr-1 mr-1 bg-transparent border-b-2 border-yellow-500  focus:border-gray-100 focus:outline-none transition-colors duration-300"
          type="text"
          name="Vizualization query"
          value={currentQuery}
          id=""
          onChange={(e) => handleUpdateQuery(e.target.value)}
        />
        <SearchBar availableSearches={availableQueries} />

        <button className="btn-primary" disabled={!currentQuery.trim()}>
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
