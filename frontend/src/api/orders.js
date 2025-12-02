import api from './axios';

// Create Order (Buyer)
export const createOrder = async (orderData) => {
  // orderData: { products: [{ productId, quantity }] }
  const response = await api.post('/orders', orderData);
  return response.data;
};

// Get Orders (Logic varies by Role in backend)
export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

// Get Specific User Orders (Buyer History)
export const getUserOrders = async (userId) => {
  const response = await api.get(`/orders/user/${userId}`);
  return response.data;
};

// Update Order Status (Seller)
export const updateOrderStatus = async (id, status) => {
  // status: "pending" | "shipping" | "delivered" | "cancelled"
  const response = await api.put(`/orders/${id}`, { status });
  return response.data;
};

// Delete/Cancel Order
export const deleteOrder = async (id) => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};