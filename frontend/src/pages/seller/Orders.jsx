import React, { useState, useEffect } from 'react';
import { getOrders } from '../../api/orders';
import OrderItem from '../../components/seller/OrderItem';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getOrders(); // Backend auto-filters for seller
      // Sort by newest first
      const sorted = (res.orders || res).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
    } catch (err) {
      console.error("Fetch orders failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    // Optimistic UI update
    setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
  };

  // Filter Logic
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Orders</h1>
        
        {/* Status Filter */}
        <div className="mt-4 sm:mt-0">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border-gray-300 border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="shipping">Shipping</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg shadow text-gray-500">
            No orders found in this category.
          </div>
        ) : (
          filteredOrders.map(order => (
            <OrderItem 
              key={order._id} 
              order={order} 
              onStatusChange={handleStatusUpdate} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;