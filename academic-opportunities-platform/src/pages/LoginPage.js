// src/pages/LoginPage.js
import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { login, googleLogin } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      navigate('/profile');
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      const data = await googleLogin(response.credential);
      localStorage.setItem('token', data.token);
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
          {error && <p>{error}</p>}
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
