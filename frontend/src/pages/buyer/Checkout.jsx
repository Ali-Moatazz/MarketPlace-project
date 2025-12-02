import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../../context/CartContext';
import AuthContext from '../../context/AuthContext';
import { createOrder } from '../../api/orders';
import Button from '../../components/common/Button';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate('/')}>Go Shopping</Button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    // Format data for backend: { products: [{ productId, quantity }] }
    const orderPayload = {
      products: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    try {
      const res = await createOrder(orderPayload);
      if (res.success) {
        clearCart();
        navigate('/profile'); // Redirect to order history
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Order creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Items</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                    {item.image && <img src={item.image} alt="" className="w-full h-full object-cover"/>}
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>Free</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-2">Shipping To:</h3>
              <p className="text-sm text-gray-600">{user?.name}</p>
              <p className="text-sm text-gray-600">{user?.address}</p>
              <p className="text-sm text-gray-600">{user?.phone}</p>
              <p className="text-xs text-blue-500 mt-2 cursor-pointer" onClick={() => navigate('/profile')}>
                Change in Profile
              </p>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm mb-4">{error}</div>}

            <Button 
              onClick={handlePlaceOrder} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;