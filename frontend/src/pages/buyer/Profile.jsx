import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { getUserOrders } from '../../api/orders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FlagUserModal from '../../components/seller/FlagUserModal';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Flagging State
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [selectedOrderForFlag, setSelectedOrderForFlag] = useState(null);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await getUserOrders(user.id || user._id);
      setOrders(res.orders || []);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFlagModal = (order) => {
    // We need the Seller ID to flag them.
    // Based on "One Seller per Order" rule, we take the seller from the first product
    const seller = order.products[0]?.productId?.sellerId;
    if (!seller) return alert("Seller info not found");

    setSelectedOrderForFlag({
      orderId: order._id,
      reportedUser: seller
    });
    setFlagModalOpen(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Profile Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
        <div className="text-right mt-4 md:mt-0">
          <p className="text-sm font-medium">Shipping Address:</p>
          <p className="text-gray-600">{user.address}</p>
          <p className="text-gray-600">{user.phone}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Order History</h2>

      {orders.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-lg shadow-sm text-gray-500">
          You haven't placed any orders yet.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b">
                <div>
                  <p className="text-sm text-gray-500">Order Placed</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium">${order.totalPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase 
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order #</p>
                  <p className="font-mono text-sm">{order._id.slice(-6)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                {order.products.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center mb-4 last:mb-0">
                    <div className="flex items-center">
                       {/* Assuming product population works */}
                       <div className="font-medium text-gray-800">
                         {item.quantity}x {item.productId?.title || 'Unknown Item'}
                       </div>
                    </div>
                    <div className="text-gray-600">
                      ${item.productId?.price}
                    </div>
                  </div>
                ))}
                
                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-4 border-t pt-4">
                  {(order.status === 'pending' || order.status === 'shipping') && (
                     <button 
                       onClick={() => handleOpenFlagModal(order)}
                       className="text-sm text-red-600 hover:text-red-800 font-medium"
                     >
                       Report Issue / Flag Seller
                     </button>
                  )}
                  {/* You can add a "Track Order" button here if you want */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flag Modal */}
      {selectedOrderForFlag && (
        <FlagUserModal
          isOpen={flagModalOpen}
          onClose={() => setFlagModalOpen(false)}
          reportedUser={selectedOrderForFlag.reportedUser}
          orderId={selectedOrderForFlag.orderId}
          onSuccess={() => alert('Report submitted to admins.')}
        />
      )}
    </div>
  );
};

export default Profile;