import React, { useState } from 'react';
import { updateOrderStatus } from '../../api/orders';
import FlagUserModal from './FlagUserModal'; // IMPORTED: The reporting modal

const OrderItem = ({ order, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false); // STATE: Controls the report modal

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;

    setUpdating(true);
    try {
      const res = await updateOrderStatus(order._id, newStatus);
      if (res.success) {
        onStatusChange(order._id, newStatus); // Callback to parent to update UI
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (s) => {
    if (s === 'delivered') return 'bg-green-100 text-green-800';
    if (s === 'cancelled') return 'bg-red-100 text-red-800';
    if (s === 'shipping') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg">Order #{order._id.slice(-6)}</h4>
          <p className="text-sm text-gray-500">
            Placed by: {order.userId?.name} ({order.userId?.email})
          </p>

          {/* WARNING: Appears if the buyer has been flagged by other sellers before */}
          {order.userId?.flagsCount > 0 && (
            <div className="mt-2 bg-red-100 border border-red-200 text-red-700 px-3 py-1 rounded text-xs font-bold flex items-center gap-1 animate-pulse">
              <span>⚠️ Warning: This buyer has been flagged {order.userId.flagsCount} times!</span>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-2">
            Date: {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <div className="mt-2 text-sm">
            <strong>Shipping Address:</strong> <br />
            {order.userId?.address || "No address provided"}
          </div>
        </div>

        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
            {order.status.toUpperCase()}
          </span>
          <p className="font-bold text-xl mt-2">${order.totalPrice}</p>
        </div>
      </div>

      <div className="mt-4 border-t pt-2">
        <h5 className="font-semibold text-sm mb-2">Items:</h5>
        {order.products.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm text-gray-700">
            <span>{item.quantity}x {item.productId?.title || 'Unknown Product'}</span>
            <span>${(item.productId?.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Seller Actions */}
      <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
        {['pending', 'shipping', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={updating || order.status === status}
            className={`px-3 py-1 text-xs rounded border capitalize 
              ${order.status === status ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50 text-gray-700 border-gray-300'}`}
          >
            Mark {status}
          </button>
        ))}

        {/* REPORT BUYER BUTTON: Only appears for Delivered or Cancelled orders */}
        {(order.status === 'delivered' || order.status === 'cancelled') && (
          <button
            onClick={() => setIsFlagModalOpen(true)}
            className="ml-auto px-4 py-1 text-xs rounded border border-red-500 text-red-600 font-bold hover:bg-red-50 transition-colors"
          >
            🚩 Report Buyer
          </button>
        )}
      </div>

      {/* REPORTING MODAL */}
      <FlagUserModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        reportedUser={order.userId}
        orderId={order._id}
        onSuccess={() => alert('The buyer has been reported successfully.')}
      />
    </div>
  );
};

export default OrderItem;