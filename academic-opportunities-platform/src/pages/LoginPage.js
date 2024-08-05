import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './LoginPage.module.css';


const clientId = 'YOUR_GOOGLE_CLIENT_ID';

function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onSuccess = (response) => {
    console.log('Login Success:', response);
    alert('Logged in successfully!');
  };

  const onFailure = (response) => {
    console.log('Login failed:', response);
    alert('Failed to login.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      console.log('Registering:', { name, email, password });
      // Handle registration logic here
    } else {
      console.log('Logging in:', { email, password });
      // Handle login logic here
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div>
        <h1>{isRegistering ? 'Register' : 'Login'} Page</h1>
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <div>
                <label>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </>
          )}
          <div>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {isRegistering && (
            <>
              <div>
                <label>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </>
          )}
          <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        </form>
        <button onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Switch to Login' : 'Switch to Register'}
        </button>
        <div>
          <h2>Or</h2>
          <GoogleLogin onSuccess={onSuccess} onError={onFailure} />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default LoginPage;

