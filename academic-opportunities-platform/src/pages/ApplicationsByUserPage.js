import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ApplicationsByUserPage() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyApplications = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authorization required');
        return;
      }

      try {
        // Fetch the user's applications
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/my-applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const applicationsWithDetails = await Promise.all(
          response.data.map(async (application) => {
            // Fetch opportunity details for each application
            const opportunityResponse = await axios.get(`${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/opportunities/${application.OpportunityID}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            return {
              ...application,
              OpportunityTitle: opportunityResponse.data.Title,  // Add the opportunity title
            };
          })
        );

        setApplications(applicationsWithDetails);
      } catch (error) {
        setError('Failed to fetch your applications');
      }
    };

    fetchMyApplications();
  }, []);

  return (
    <div>
      <h1>My Applications</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {applications.length > 0 ? (
        <ul>
          {applications.map((application) => (
            <li key={application.ApplicationID}>
              <p><strong>Opportunity:</strong> {application.OpportunityTitle}</p>
              <p><strong>Application Date:</strong> {new Date(application.ApplicationDate).toLocaleString()}</p>
              <p><strong>Motivation Letter:</strong> {application.MotivationLetter}</p>
              {application.CV && (
                <p><strong>CV:</strong> <a href={application.CV} target="_blank" rel="noopener noreferrer">Download CV</a></p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !error && <p>You have not submitted any applications yet</p>
      )}
    </div>
  );
}

export default ApplicationsByUserPage;
