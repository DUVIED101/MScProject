import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function ApplicationsByOppPage() {
  const { id } = useParams(); 
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authorization required');
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/opportunities/${id}/applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setApplications(response.data);
      } catch (error) {
        setError('Failed to fetch applications');
      }
    };

    fetchApplications();
  }, [id]);

  return (
    <div>
      <h1>Applications for Opportunity</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {applications.length > 0 ? (
        <ul>
          {applications.map((application) => (
            <li key={application.ApplicationID}>
              <p><strong>User ID:</strong> {application.UserID}</p>
              <p><strong>Application Date:</strong> {new Date(application.ApplicationDate).toLocaleString()}</p>
              <p><strong>Motivation Letter:</strong> {application.MotivationLetter}</p>
            </li>
          ))}
        </ul>
      ) : (
        !error && <p>No applications found</p>
      )}
    </div>
  );
}

export default ApplicationsByOppPage;
