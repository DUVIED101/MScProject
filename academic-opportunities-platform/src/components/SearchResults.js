import React from 'react';

function SearchResults({ results }) {
  return (
    <div className="search-results">
      <h2>Search Results</h2>
      <ul>
        {results.length > 0 ? (
          results.map((item) => (
            <li key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))
        ) : (
          <p>No results found</p>
        )}
      </ul>
    </div>
  );
}

export default SearchResults;
