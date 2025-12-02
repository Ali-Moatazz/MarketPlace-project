import api from './axios';

// Register User (Handles both Buyer and Seller based on role payload)
export const registerUser = async (userData) => {
  // userData: { name, email, password, role, address, phone, storeName?, googleAppPassword? }
  const response = await api.post('/users/register', userData);
  return response.data;
};

// Login User
export const loginUser = async (credentials) => {
  // credentials: { email, password }
  const response = await api.post('/users/login', credentials);
  return response.data;
};

// Get Current Profile (Protected)
export const getMyProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};