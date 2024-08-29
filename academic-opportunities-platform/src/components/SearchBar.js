import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    degreeLevel: '',
    location: '',
  });

  const handleSearch = () => {
    onSearch(query, filters);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search opportunities..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <select
        value={filters.degreeLevel}
        onChange={(e) => setFilters({ ...filters, degreeLevel: e.target.value })}
      >
        <option value="">Select Degree Level</option>
        <option value="bachelor">Bachelor</option>
        <option value="master">Master</option>
        <option value="phd">PhD</option>
      </select>
      <input
        type="text"
        placeholder="Location"
        value={filters.location}
        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

export default SearchBar;
