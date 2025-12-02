import api from './axios';

// Create Flag (Report User)
export const createFlag = async (flagData) => {
  // flagData: { reporterId, reportedId, orderId, reason, type }
  const response = await api.post('/flags', flagData);
  return response.data;
};

// Get Flags against a specific User (Seller viewing Buyer's history or Admin)
export const getUserFlags = async (userId) => {
  const response = await api.get(`/flags/reported/${userId}`);
  return response.data;
};

// Update Flag Status (Resolve)
export const updateFlagStatus = async (id, status) => {
  // status: 'open' | 'resolved'
  const response = await api.put(`/flags/${id}/status`, { status });
  return response.data;
};