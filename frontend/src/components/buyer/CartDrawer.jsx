import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../../context/CartContext';
import Button from '../common/Button';

const CartDrawer = ({ isOpen, onClose }) => {
  // Destructure 'updateQuantity' from context to enable the +/- buttons
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" 
          onClick={onClose}
        ></div>
      )}

      {/* Drawer Panel */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">Your Cart</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <p>Your cart is empty.</p>
                <button onClick={onClose} className="text-blue-600 underline mt-2">Start Shopping</button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.productId} className="flex border-b pb-4">
                  {/* Image Thumbnail - Fixed Size with Object Cover */}
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                     {item.image ? (
                        <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover" 
                        />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                     )}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Sold by: {item.storeName}</p>
                    
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-2 text-sm font-medium text-gray-800 border-l border-r border-gray-300">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 text-xs hover:text-red-700 mt-2 underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Checkout */}
          {cartItems.length > 0 && (
            <div className="border-t p-4 bg-gray-50">
              <div className="flex justify-between mb-4 text-lg font-bold">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <Button onClick={handleCheckout} className="w-full">
                  Checkout
                </Button>
                <button 
                  onClick={clearCart} 
                  className="w-full text-center text-sm text-red-500 hover:text-red-700"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;