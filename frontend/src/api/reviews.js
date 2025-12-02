import api from './axios';

// Create Review
export const createReview = async (reviewData) => {
  // reviewData: { productId, userId, rating, comment }
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

// Get Reviews for a Product
export const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

// --- AI Feature ---
// Get AI Summary of reviews
export const getReviewSummary = async (productId) => {
  const response = await api.get(`/reviews/summary/${productId}`);
  return response.data; // Returns { success: true, summary: "..." }
};