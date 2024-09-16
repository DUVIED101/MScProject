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
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/my-applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setApplications(response.data);
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
              <p><strong>Opportunity ID:</strong> {application.OpportunityID}</p>
              <p><strong>Application Date:</strong> {new Date(application.ApplicationDate).toLocaleString()}</p>
              <p><strong>Motivation Letter:</strong> {application.MotivationLetter}</p>
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
