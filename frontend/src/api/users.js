import api from './axios';

// Get List of All Sellers (For Marketplace discovery or Admin)
export const getAllSellers = async () => {
  const response = await api.get('/users/sellers');
  return response.data;
};

// Get Specific Seller details
export const getSellerById = async (id) => {
  const response = await api.get(`/users/sellers/${id}`);
  return response.data;
};

// Update My Profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};