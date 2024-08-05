import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const clientId = 'YOUR_GOOGLE_CLIENT_ID';

function LoginPage() {
  const onSuccess = (response) => {
    console.log('Login Success:', response);
    alert('Logged in successfully!');
  };

  const onFailure = (response) => {
    console.log('Login failed:', response);
    alert('Failed to login.');
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div>
        <h1>Login Page</h1>
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onFailure}
        />
      </div>
    </GoogleOAuthProvider>
  );
}

export default LoginPage;
