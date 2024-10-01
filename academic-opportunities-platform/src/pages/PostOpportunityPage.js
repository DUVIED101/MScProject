import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PostOpportunityPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [subjectFilters, setSubjectFilters] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You need to log in to post an opportunity');
      return navigate('/login');
    }

    const subjectArray = subjectFilters.split(',').map(subject => subject.trim()); // Process subjects as an array

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/opportunities`, {
        title,
        description,
        location,
        deadline,
        educationLevel,
        subjectFilters: subjectArray,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage('Opportunity posted successfully!');
      setError(null);
      setTitle('');
      setDescription('');
      setLocation('');
      setDeadline('');
      setEducationLevel('');
      setSubjectFilters('');
    } catch (error) {
      setError('Failed to post opportunity. Please try again.');
    }
  };

  return (
    <div>
      <h1>Post Opportunity</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Education Level</label>
          <input
            type="text"
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Subject Filters (comma separated)</label>
          <input
            type="text"
            value={subjectFilters}
            onChange={(e) => setSubjectFilters(e.target.value)}
            placeholder="e.g., Math, Science, Engineering"
            required
          />
        </div>
        <button type="submit">Post Opportunity</button>
      </form>
    </div>
  );
}

export default PostOpportunityPage;
