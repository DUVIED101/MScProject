import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/auth';

export async function login(email, password) {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
}

export async function register(name, email, password) {
  const response = await axios.post(`${API_URL}/register`, { name, email, password });
  return response.data;
}

export async function googleLogin(tokenId) {
  const response = await axios.post(`${API_URL}/google`, { tokenId });
  return response.data;
}

export async function getProfile(token) {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
