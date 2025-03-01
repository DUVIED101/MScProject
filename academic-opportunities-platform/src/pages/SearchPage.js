import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function SearchPage() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [subjectFilters, setSubjectFilters] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllOpportunities = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_SEARCH_URL}/api/opportunities`);
        setResults(response.data);
        setError('');
      } catch (error) {
        setResults([]);
        setError('Error loading opportunities');
      }
    };

    fetchAllOpportunities();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_SEARCH_URL}/api/opportunities/search`, {
        params: {
          title,
          location,
          educationLevel,
          subjectFilters: subjectFilters.join(',')
        },
      });
      setResults(response.data);
      setError('');
    } catch (error) {
      setResults([]);
      setError('No matching opportunities found');
    }
  };

  const handleSubjectFilterChange = (e) => {
    const { options } = e.target;
    const selectedFilters = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    setSubjectFilters(selectedFilters);
  };

  const handleClearFilters = () => {
    setTitle('');
    setLocation('');
    setEducationLevel('');
    setSubjectFilters([]);
    window.location.reload();
  };

  return (
    <div className="search-page">
      <div className="filters">
        <h2>Filters</h2>
        <form onSubmit={handleSearch}>
          <div>
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label>Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <label>Education Level</label>
            <input type="text" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} />
          </div>
          <div>
            <label>Subject Filters (hold CTRL/Command for multiple)</label>
            <select multiple onChange={handleSubjectFilterChange} value={subjectFilters}>
              <option value="Math">Math</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Data Science">Data Science</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
            </select>
          </div>
          <button type="submit">Search</button>
          <button type="button" onClick={handleClearFilters} style={{ marginLeft: '10px' }}>
            Clear Filters
          </button>
        </form>
      </div>

      <div className="results">
        <h2>Available Opportunities</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {results.length > 0 ? (
          <ul>
            {results.map((opportunity) => (
              <li key={opportunity.OpportunityID}>
                <h3>
                  <Link to={`/opportunities/${opportunity.OpportunityID}`}>
                    {opportunity.Title}
                  </Link>
                </h3>
                <p>{opportunity.Description}</p>
                <p><strong>Deadline:</strong> {opportunity.Deadline}</p>
              </li>
            ))}
          </ul>
        ) : (
          !error && <p>No opportunities found</p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
