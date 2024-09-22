import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ApplicationFormPage() {
  const { opportunityID } = useParams();
  const [motivationLetter, setMotivationLetter] = useState('');
  const [cvFile, setCvFile] = useState(null);  // State to store the uploaded CV file
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setCvFile(e.target.files[0]);  // Store the selected file in state
  };

  const handleApply = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You need to log in to apply');
      return navigate('/login');
    }

    //object to handling the file and other form data
    const formData = new FormData();
    formData.append('motivationLetter', motivationLetter);
    if (cvFile) {
      formData.append('cv', cvFile);
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/opportunities/${opportunityID}/apply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',  // Required for file uploads
          },
        }
      );

      setSuccessMessage('Application submitted successfully!');
      setError('');
      setMotivationLetter('');
      setCvFile(null); 
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
          <label>Upload CV (optional)</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        </div>
        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
}

export default ApplicationFormPage;
