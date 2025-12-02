import api from './axios';

// --- Public Routes ---

// Get all products (Buyer Home)
export const getAllProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

// Get single product details
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Search & Filter
export const searchProducts = async (keyword, category) => {
  // Backend expects: /api/products/search?keyword=...&category=...
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (category) params.append('category', category);
  
  const response = await api.get(`/products/search?${params.toString()}`);
  return response.data;
};

// Get Categories list
export const getCategories = async () => {
  const response = await api.get('/products/categories');
  return response.data;
};

// Get Products by specific Category
export const getProductsByCategory = async (category) => {
  const response = await api.get(`/products/category/${category}`);
  return response.data;
};

// --- Seller Routes (Protected) ---

// Create new product
export const createProduct = async (productData) => {
  // productData: { title, description, price, category, stock, deliveryTimeEstimate, images }
  const response = await api.post('/products', productData);
  return response.data;
};

// Update product
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Delete product
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};