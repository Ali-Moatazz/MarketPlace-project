import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
// --- EDIT: Import CartContext ---
import CartContext from '../../context/CartContext'; 

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  // --- EDIT: Get cart state from Context ---
  const { cartCount, setIsCartOpen } = useContext(CartContext); 
  
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <span>🛍️</span> MarketPlace
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-6">
            
            {/* --- NEW EDIT: Cart Icon (Only for Buyers or Guests) --- */}
            {(!user || user.role === 'buyer') && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition"
                title="View Cart"
              >
                {/* SVG Icon */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                
                {/* Red Notification Badge */}
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Links */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  Hi, {user.name}
                </span>
                
                {user.role === 'buyer' && (
                  <Link to="/profile" className="text-sm text-gray-600 hover:text-blue-500">
                    My Orders
                  </Link>
                )}

                {user.role === 'seller' && (
                  <Link to="/seller/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 px-3 py-1 rounded">
                    Seller Dashboard
                  </Link>
                )}

                <button 
                  onClick={handleLogout}
                  className="text-sm bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-blue-500 font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium transition shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;