import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

function OpportunityDetailPage() {
  const { opportunityID } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOpportunityDetails = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authorization required');
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/opportunities/${opportunityID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Fetched opportunity details: ', response.data);
        setOpportunity(response.data);
      } catch (error) {
        console.error('Error fetching opportunity details:', error);
        setError('Failed to fetch opportunity details');
      }
    };

    fetchOpportunityDetails();
  }, [opportunityID]);

  return (
    <div>
      <h1>Opportunity Details</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {opportunity ? (
        <div>
          <h2>{opportunity.Title}</h2>
          <p>{opportunity.Description}</p>
          <p><strong>Location:</strong> {opportunity.Location}</p>
          <p><strong>Deadline:</strong> {opportunity.Deadline}</p>
          <p><strong>Education Level:</strong> {opportunity.EducationLevel}</p>
          <p><strong>Subjects:</strong> {opportunity.SubjectFilters.join(', ')}</p>

          <Link to={`/opportunities/${opportunity.OpportunityID}/apply`}>
            <button>Apply for this Opportunity</button>
          </Link>
        </div>
      ) : (
        !error && <p>Loading opportunity details...</p>
      )}
    </div>
  );
}

export default OpportunityDetailPage;
