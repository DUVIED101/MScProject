import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function OpportunityListPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpportunities = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/opportunities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOpportunities(response.data);
      } catch (err) {
        setError('Failed to fetch opportunities');
      }
    };

    fetchOpportunities();
  }, [navigate]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/opportunities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpportunities(opportunities.filter(opp => opp.OpportunityID !== id));
    } catch (err) {
      setError('Failed to delete opportunity');
    }
  };

  return (
    <div>
      <h1>Your Opportunities</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {opportunities.map(opp => (
          <li key={opp.OpportunityID}>
            <h3>{opp.Title}</h3>
            <p>{opp.Description}</p>
            <Link to={`/opportunities/${opp.OpportunityID}`}>View</Link> | 
            <Link to={`/opportunities/edit/${opp.OpportunityID}`}>Edit</Link> | 
            <button onClick={() => handleDelete(opp.OpportunityID)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OpportunityListPage;
