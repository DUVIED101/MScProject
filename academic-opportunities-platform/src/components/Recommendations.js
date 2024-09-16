import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_SEARCH_URL}/api/recommendations`);
        setRecommendations(response.data);
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="recommendations">
      <h2>Recommended for You</h2>
      <ul>
        {recommendations.map((item) => (
          <li key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Recommendations;
