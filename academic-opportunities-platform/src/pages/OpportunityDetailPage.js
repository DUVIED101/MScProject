import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function OpportunityDetailPage() {
  const { opportunityID } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [error, setError] = useState('');
  const [isCreator, setIsCreator] = useState(false);  // State to track if the logged-in user is the creator

  useEffect(() => {
    const fetchOpportunityDetails = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authorization required');
        return;
      }

      try {
        // Fetch opportunity details
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/opportunities/${opportunityID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOpportunity(response.data);

        // Fetch the current user profile to check if they are the creator
        const userProfile = await axios.get(`${process.env.REACT_APP_BACKEND_USER_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Check if the current user is the creator of the opportunity
        setIsCreator(userProfile.data.id === response.data.PostedBy);  // Match userId with opportunity's PostedBy
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

          {/* Show the apply button if the user is not the creator */}
          {!isCreator && (
            <Link to={`/opportunities/${opportunity.OpportunityID}/apply`}>
              <button>Apply for this Opportunity</button>
            </Link>
          )}

          {/* Conditionally show the button if the logged-in user is the creator of the opportunity */}
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

      {/* Show a 404 error if no opportunity is found */}
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
