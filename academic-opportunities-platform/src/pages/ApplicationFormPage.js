import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ApplicationFormPage() {
  const { opportunityID } = useParams();
  const [motivationLetter, setMotivationLetter] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleApply = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You need to log in to apply');
      return navigate('/login');
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/opportunities/${opportunityID}/apply`, {
        motivationLetter,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage('Application submitted successfully!');
      setError('');
      setMotivationLetter('');
    } catch (error) {
      setError('Failed to submit application. Please try again.');
    }
  };

  return (
    <div>
      <h1>Apply for Opportunity</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <form onSubmit={handleApply}>
        <div>
          <label>Motivation Letter</label>
          <textarea
            value={motivationLetter}
            onChange={(e) => setMotivationLetter(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
        </div>
        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
}

export default ApplicationFormPage;
