import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/authService';
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
        } else {
          const data = await getProfile(token);
          setProfile(data);
        }
      } catch (error) {
        setError(error.response.data.message);
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <div>
      <h1>User Profile</h1>
      {error && <p>{error}</p>}
      {profile && (
        <div>
          <p>Name: {profile.name}</p>
          <p>Email: {profile.email}</p>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
