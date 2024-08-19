import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/authService';  // Make sure this function sends the correct API request
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        const data = await getProfile(token);
        setProfile(data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(error.response ? error.response.data.message : 'Failed to fetch profile');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <div>
      <h1>User Profile</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {profile ? (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
        </div>
      ) : (
        !error && <p>Loading profile...</p>
      )}
    </div>
  );
}

export default ProfilePage;

