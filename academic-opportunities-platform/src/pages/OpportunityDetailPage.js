import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function OpportunityDetailPage() {
  const { opportunityID } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [error, setError] = useState('');
  const [isCreator, setIsCreator] = useState(false); 

  useEffect(() => {
    const fetchOpportunityDetails = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authorization required');
        return;
      }

      // Getting opportunity details
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/opportunities/${opportunityID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOpportunity(response.data);

        // Getting the current usr
        const userProfile = await axios.get(`${process.env.REACT_APP_BACKEND_USER_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Checking if the user iscreator of the opportunity
        setIsCreator(userProfile.data.id === response.data.PostedBy); 
      } catch (error) {
        console.error('Error fetching opportunity details or user profile:', error);
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

          {!isCreator && (
            <Link to={`/opportunities/${opportunity.OpportunityID}/apply`}>
              <button>Apply for this Opportunity</button>
            </Link>
          )}
          {isCreator && (
            <div style={{ marginTop: '20px' }}>
              <Link to={`/opportunities/${opportunity.OpportunityID}/applications`}>
                <button>View Applications for this Opportunity</button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        !error && <p>Loading opportunity details...</p>
      )}
      {error === 'Failed to fetch opportunity details' && (
        <div>
          <h2>404: Opportunity Not Found</h2>
          <p>The opportunity you're looking for does not exist or you do not have access to it.</p>
        </div>
      )}
    </div>
  );
}

export default OpportunityDetailPage;
