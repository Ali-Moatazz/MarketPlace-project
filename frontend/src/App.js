import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext'; // <--- IMPORT THIS

// Layouts
import BuyerLayout from './layouts/BuyerLayout';
import SellerLayout from './layouts/SellerLayout';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages - Buyer
import Home from './pages/buyer/Home';
import ProductDetails from './pages/buyer/ProductDetails';
import Checkout from './pages/buyer/Checkout';
import Profile from './pages/buyer/Profile';
import Favorites from './pages/buyer/Favorites'; // <--- IMPORT THIS (Make sure file exists)

// Pages - Seller
import Dashboard from './pages/seller/Dashboard';
import Inventory from './pages/seller/Inventory';
import Orders from './pages/seller/Orders';
import Analytics from './pages/seller/Analytics';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          {/* Wrap everything in FavoritesProvider so the Navbar and Page can access data */}
          <FavoritesProvider> 
            <Routes>
              
              {/* --- Public Auth Routes --- */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* --- Seller Routes --- */}
              <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
                <Route path="/seller" element={<SellerLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route index element={<Navigate to="/seller/dashboard" replace />} />
                </Route>
              </Route>

              {/* --- Buyer / Public Routes --- */}
              <Route path="/" element={<BuyerLayout />}>
                <Route index element={<Home />} />
                <Route path="product/:id" element={<ProductDetails />} />
                
                {/* Nested Protected Routes for Buyer Actions */}
                <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="profile" element={<Profile />} />
                  
                  {/* ADD FAVORITES ROUTE HERE */}
                  <Route path="favorites" element={<Favorites />} /> 
                </Route>
              </Route>

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;