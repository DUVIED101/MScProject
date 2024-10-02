import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function ApplicationsByOppPage() {
  const { id } = useParams(); 
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const creatorID = localStorage.getItem('userID');

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

  const handleCreateConversation = async (applicantID, opportunityID, creatorID) => {
    const token = localStorage.getItem('token');

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_MESSAGING_URL}/api/conversations`, {
        id,
        applicantID,
        creatorID,
        opportunityID
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Conversation created successfully');
    } catch (error) {
      alert('Failed to create conversation');
    }
  };

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
              {application.CVUrl && (
                <p>
                  <strong>CV:</strong> <a href={application.CVUrl} target="_blank" rel="noopener noreferrer">Download CV</a>
                </p>
              )}
             <button onClick={() => handleCreateConversation(application.UserID, application.OpportunityID, creatorID)}>Message</button>
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
