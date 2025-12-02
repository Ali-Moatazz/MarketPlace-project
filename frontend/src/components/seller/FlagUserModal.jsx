import React, { useState, useContext } from 'react';
import { createFlag } from '../../api/flags';
import AuthContext from '../../context/AuthContext';
import Button from '../common/Button';

const FlagUserModal = ({ isOpen, onClose, reportedUser, orderId, onSuccess }) => {
  const { user: currentUser } = useContext(AuthContext);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // FIX: Safely extract the ID. 
    // If reportedUser is an object (populated), use ._id
    // If reportedUser is just a string (ID only), use it directly
    const targetUserId = reportedUser?._id || reportedUser;

    if (!targetUserId) {
        setError("Error: Could not identify the user to report.");
        setLoading(false);
        return;
    }

    // Determine flag type based on current user role
    const type = currentUser.role === 'seller' ? 'seller_flagging_buyer' : 'buyer_flagging_seller';

    try {
      await createFlag({
        reporterId: currentUser._id, // Backend gets this from token, but we can leave it
        reportedId: targetUserId,    // <--- USE THE SAFELY EXTRACTED ID
        orderId: orderId,
        reason: reason,
        type: type
      });
      alert('Flag submitted successfully');
      setReason('');
      onSuccess(); 
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit flag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-red-600">Report User</h2>
        <p className="mb-4 text-sm text-gray-600">
          You are reporting <strong>{reportedUser?.name}</strong> related to Order <strong>#{orderId?.slice(-6)}</strong>.
        </p>

        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason for flagging:</label>
          <textarea
            className="w-full border border-gray-300 rounded p-2 focus:ring-red-500 focus:border-red-500"
            rows="4"
            placeholder="e.g., Buyer claimed non-receipt falsely..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          ></textarea>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="danger" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Flag'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlagUserModal;