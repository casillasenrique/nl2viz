const Suggestion = ({
  query,
  currentQuery,
  handleClickedSuggestion,
  highlight,
}) => {
  const getIndexRange = (query, currentQuery) => {
    if (!highlight) {
      return [-1, -1];
    }
    const index = query.toLowerCase().indexOf(currentQuery.toLowerCase());
    return [index, index + currentQuery.length];
  };

  return (
    <li>
      <button
        className="w-full bg-transparent text-left hover:bg-yellow-600 text-gray-50 font-semibold hover:text-white py-2 px-4 hover:border-transparent rounded"
        onClick={() => handleClickedSuggestion(query)}
      >
        {query.split('').map((char, i) => {
          const [start, end] = getIndexRange(query, currentQuery);
          if (i >= start && i < end) {
            return (
              <span key={`${i}char`} className="font-extrabold text-white">
                {char}
              </span>
            );
          }
          return char;
        })}
      </button>
    </li>
  );
};

export default Suggestion;
