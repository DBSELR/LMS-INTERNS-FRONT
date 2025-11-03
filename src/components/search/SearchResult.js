import React from "react";

function SearchResult({ results }) {
  // Ensure results is always an array
  const resultItems = Array.isArray(results) ? results : [];

  return (
    <div>
      {resultItems.length > 0 ? (
        <ul className="list-unstyled">
          {resultItems.map((result, index) => (
            <li key={index}>
              <h6>
                <a href="javascript:void(0)">{result.title}</a>
              </h6>
              <p className="text-muted">{result.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
}

export default SearchResult;
