import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditOpportunityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [subjectFilters, setSubjectFilters] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpportunity = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/opportunities/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const opp = response.data;
        setTitle(opp.Title);
        setDescription(opp.Description);
        setLocation(opp.Location);
        setDeadline(opp.Deadline);
        setEducationLevel(opp.EducationLevel);
        setSubjectFilters(opp.SubjectFilters.join(', '));
      } catch (err) {
        setError('Failed to fetch opportunity');
      }
    };

    fetchOpportunity();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_OPPORTUNITY_URL}/api/opportunities/${id}`, {
        title,
        description,
        location,
        deadline,
        educationLevel,
        subjectFilters: subjectFilters.split(',').map(f => f.trim()),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/opportunities');
    } catch (err) {
      setError('Failed to update opportunity');
    }
  };

  return (
    <div>
      <h1>Edit Opportunity</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>Location</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div>
          <label>Deadline</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required />
        </div>
        <div>
          <label>Education Level</label>
          <input type="text" value={educationLevel} onChange={e => setEducationLevel(e.target.value)} />
        </div>
        <div>
          <label>Subject Filters (comma-separated)</label>
          <input type="text" value={subjectFilters} onChange={e => setSubjectFilters(e.target.value)} />
        </div>
        <button type="submit">Update Opportunity</button>
      </form>
    </div>
  );
}

export default EditOpportunityPage;
