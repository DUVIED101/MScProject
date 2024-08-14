import React, { useState } from 'react';
import axios from 'axios';
import './OpportunityPostingForm.css';

function OpportunityPostingForm({ user }) { // Accept user as a prop
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const opportunityData = {
      title,
      description,
      location,
      deadline,
      postedBy: user.email, // Add user email or ID to the opportunity data
    };

    try {
      const response = await axios.post('http://localhost:5001/api/opportunities', opportunityData);
      if (response.status === 200) {
        setSuccessMessage('Opportunity posted successfully!');
        setErrorMessage('');
        // Clear the form
        setTitle('');
        setDescription('');
        setLocation('');
        setDeadline('');
      } else {
        throw new Error('Failed to post opportunity');
      }
    } catch (error) {
      setErrorMessage('There was an error posting the opportunity.');
      setSuccessMessage('');
      console.error(error);
    }
  };

  return (
    <div className="opportunity-posting-form">
      <h2>Post a New Opportunity</h2>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label>Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Deadline:</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        <button type="submit">Post Opportunity</button>
      </form>
    </div>
  );
}

export default OpportunityPostingForm;
