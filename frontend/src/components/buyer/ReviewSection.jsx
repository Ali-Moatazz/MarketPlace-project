import React, { useState, useEffect } from 'react';
import { getProductReviews, getReviewSummary, createReview } from '../../api/reviews';

const ReviewSection = ({ productId, currentUser, hasPurchased }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const data = await getProductReviews(productId);
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  };

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await getReviewSummary(productId);
      if (res.success) setSummary(res.summary);
    } catch (err) {
      setSummary("Could not generate summary at this time.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await createReview({ 
        productId, 
        userId: currentUser._id, 
        rating, 
        comment: newComment 
      });
      setNewComment('');
      loadReviews(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || "Failed to post review");
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">Reviews</h3>

      {/* AI Feature Button */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-blue-800">✨ AI Review Summary</h4>
          <button 
            onClick={handleGenerateSummary}
            disabled={loadingSummary}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingSummary ? 'Generating...' : 'Summarize Reviews'}
          </button>
        </div>
        {summary && <p className="text-gray-700 italic">"{summary}"</p>}
      </div>

      {/* List Reviews */}
      <div className="space-y-4 mb-8">
        {reviews.map((rev) => (
          <div key={rev._id} className="border-b pb-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-yellow-500">★ {rev.rating}</span>
              <p className="text-gray-800">{rev.comment}</p>
            </div>
            <p className="text-xs text-gray-400">
              Posted on {new Date(rev.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
      </div>

      {/* Add Review Form (Only if purchased - Logic handled in Parent usually, but added here for demo) */}
      {currentUser && (
        <form onSubmit={handleSubmitReview} className="bg-gray-50 p-4 rounded">
          <h4 className="font-bold mb-2">Write a Review</h4>
          <div className="mb-2">
            <label className="mr-2">Rating:</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border rounded p-1">
              {[5,4,3,2,1].map(num => <option key={num} value={num}>{num}</option>)}
            </select>
          </div>
          <textarea 
            className="w-full border p-2 rounded mb-2" 
            rows="3"
            placeholder="How was the product?"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Submit Review</button>
        </form>
      )}
    </div>
  );
};

export default ReviewSection;