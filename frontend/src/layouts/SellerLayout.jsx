import React, { useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const SellerLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to highlight active menu item
  const isActive = (path) => location.pathname === path 
    ? "bg-blue-700 text-white" 
    : "text-gray-300 hover:bg-gray-800 hover:text-white";

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold tracking-wider">Seller<span className="text-blue-500">Hub</span></h2>
          <p className="text-xs text-gray-500 mt-2">Store: {user?.storeName || 'My Store'}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          
          <Link 
            to="/seller/dashboard" 
            className={`flex items-center px-4 py-3 rounded-md transition-colors ${isActive('/seller/dashboard')}`}
          >
            <span className="mr-3">📊</span>
            Dashboard
          </Link>

          <Link 
            to="/seller/inventory" 
            className={`flex items-center px-4 py-3 rounded-md transition-colors ${isActive('/seller/inventory')}`}
          >
            <span className="mr-3">📦</span>
            My Inventory
          </Link>

          <Link 
            to="/seller/orders" 
            className={`flex items-center px-4 py-3 rounded-md transition-colors ${isActive('/seller/orders')}`}
          >
            <span className="mr-3">🚚</span>
            Manage Orders
          </Link>

          <Link 
            to="/seller/analytics" 
            className={`flex items-center px-4 py-3 rounded-md transition-colors ${isActive('/seller/analytics')}`}
          >
            <span className="mr-3">📈</span>
            Analytics
          </Link>

        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded transition"
          >
            <span className="mr-3">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Mobile Header (Optional, mostly for small screens if you add responsiveness later) */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6 lg:hidden">
           <span className="font-bold text-gray-800">MarketPlace Seller Panel</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default SellerLayout;