import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/buyer/CartDrawer';
import CartContext from '../context/CartContext';

const BuyerLayout = () => {
  const { isCartOpen, setIsCartOpen } = useContext(CartContext);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <Navbar />

      {/* Slide-out Cart */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
};

export default BuyerLayout;