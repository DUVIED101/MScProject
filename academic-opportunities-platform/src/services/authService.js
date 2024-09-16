import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_USER_URL || 'http://localhost:5001';

export async function login(email, password) {
  const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
  return response.data;
}

export async function register(name, email, password) {
  const response = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
  return response.data;
}

export async function googleLogin(tokenId) {
  const response = await axios.post(`${API_URL}/api/auth/google`, { tokenId });
  return response.data;
}

export async function getProfile(token) {
  const response = await axios.get(`${API_URL}/api/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
