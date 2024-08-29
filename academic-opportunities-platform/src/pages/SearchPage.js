import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import Recommendations from '../components/Recommendations';
import '../App.css';
import axios from 'axios';

function SearchPage() {
  const [results, setResults] = useState([]);

  const handleSearch = async (query, filters) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_SEARCH_URL}/api/search`, {
        params: { query, ...filters },
      });
      setResults(response.data);
    } catch (error) {
      console.error('Failed to fetch search results', error);
    }
  };

  return (
    <div className="search-page">
      <SearchBar onSearch={handleSearch} />
      <Recommendations />
      <SearchResults results={results} />
    </div>
  );
}

export default SearchPage;
