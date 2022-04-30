import { useEffect, useRef, useState } from 'react';
import './QuerySearchBar.css';
import Suggestion from './Suggestion';

const QuerySearchBar = ({
  availableQueries,
  currentQuery,
  handleUpdateQuery,
}) => {
  const [focused, setFocused] = useState(false);
  const [shownQueries, setShownQueries] = useState({
    queries: [],
    suggestions: false,
  });

  useEffect(() => {
    setShownQueries({ queries: availableQueries, suggestions: false });
  }, [availableQueries]);

  const handleUpdate = (newQuery) => {
    // setShownQueries(availableQueries.filter((query) =>
    // query.includes(newQuery)));
    console.log('Updating query to: ', newQuery);
    handleUpdateQuery(newQuery);
    autocomplete();
  };

  const autocomplete = () => {
    const suggestions = [];
    availableQueries.forEach((query) => {
      if (query.toLowerCase().includes(currentQuery.toLowerCase())) {
        suggestions.push(query);
      }
    });
    if (suggestions.length > 0) {
      setShownQueries({ queries: suggestions, suggestions: true });
      return;
    }

    setShownQueries({ queries: availableQueries, suggestions: false });
    return;
  };

  return (
    <div className="QuerySearchBar relative flex flex-col">
      <input
        className="w-[500px] h-full pb-1 pr-1 mr-1 bg-transparent border-b-2 border-yellow-500  focus:border-gray-100 focus:outline-none transition-colors duration-300"
        type="text"
        name="Vizualization query"
        value={currentQuery}
        onFocus={() => setFocused(true)}
        // Timeout since we need to wait for the button to be pressed
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        id=""
        onChange={(e) => handleUpdate(e.target.value)}
      />
      {focused && (
        <ul className="absolute z-10 w-[500px] rounded-md p-2 flex flex-col bg-slate-800  max-h-96 top-12 overflow-scroll overflow-x-hidden align-baseline shadow-md shadow-gray-700">
          {shownQueries.queries.map((query, i) => (
            <Suggestion
              key={`${i}${query}`}
              currentQuery={currentQuery}
              query={query}
              handleClickedSuggestion={() => handleUpdate(query)}
              highlight={shownQueries.suggestions}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuerySearchBar;