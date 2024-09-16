import React, { useState, useContext } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';


const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_USER_URL}/api/auth/login`, {
        email,
        password,
      });
      login(response.data.token); //function to update context
      navigate('/profile');
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Login failed');
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_USER_URL}/api/auth/google`, {
        tokenId: response.credential,
      });
      login(response.data.token);
      navigate('/profile');
    } catch (error) {
      setError('Google login failed');
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Login</button>
        </form>
        <div>
          <h2>Or</h2>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              setError('Google login failed');
            }}
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default LoginPage;
