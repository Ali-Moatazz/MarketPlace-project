import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { getOrders } from '../../api/orders';
import { getAllProducts } from '../../api/products';
import { getUserFlags } from '../../api/flags';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  
  // Dashboard Statistics State
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrders: 0,
    totalProducts: 0,
    pendingShipments: 0
  });

  // Flags/Complaints State
  const [flags, setFlags] = useState([]);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch Orders, Products, and Flags in parallel
      const [ordersData, productsData, flagsData] = await Promise.all([
        getOrders(),       // Backend auto-filters for seller
        getAllProducts(),  // Returns all products
        getUserFlags(user.id || user._id) // Fetch flags for this user
      ]);

      // 1. Filter products for this specific seller
      const myProducts = (productsData.products || productsData).filter(
        p => p.sellerId?._id === (user.id || user._id) || p.sellerId === (user.id || user._id)
      );

      // 2. Process Orders Data
      const orders = ordersData.orders || ordersData;
      const activeOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered');
      
      const sales = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      
      const pending = activeOrders.filter(o => o.status === 'pending').length;

      // 3. Update State
      setStats({
        totalSales: sales,
        activeOrders: activeOrders.length,
        totalProducts: myProducts.length,
        pendingShipments: pending
      });

      setFlags(flagsData || []);

    } catch (err) {
      console.error("Dashboard Load Failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* --- KPI Cards Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Sales */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800">${stats.totalSales.toFixed(2)}</p>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Active Orders</p>
          <p className="text-2xl font-bold text-gray-800">{stats.activeOrders}</p>
        </div>

        {/* Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Total Products</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
        </div>

        {/* Pending Action */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 uppercase font-bold">Pending Shipments</p>
          <p className="text-2xl font-bold text-gray-800">{stats.pendingShipments}</p>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/seller/inventory" className="block w-full text-center py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-medium">
              + Add New Product
            </Link>
            <Link to="/seller/orders" className="block w-full text-center py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 font-medium">
              View Incoming Orders
            </Link>
          </div>
        </div>

        {/* Store Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Store Status</h2>
          
          <div className="flex justify-between items-center border-b py-2">
            <span className="text-gray-600">Store Name:</span>
            <span className="font-medium">{user.storeName}</span>
          </div>
          
          <div className="flex justify-between items-center border-b py-2">
            <span className="text-gray-600">Service Area:</span>
            <span className="font-medium">{user.serviceArea || 'Global'}</span>
          </div>

          {/* Flags Section */}
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Flags/Complaints:</span>
            {flags.length > 0 ? (
              <button 
                onClick={() => setIsFlagModalOpen(true)}
                className="font-bold text-red-600 hover:text-red-800 underline cursor-pointer"
              >
                {flags.length} (View Details)
              </button>
            ) : (
              <span className="font-medium text-green-600">0</span>
            )}
          </div>
        </div>
      </div>

      {/* --- Flag Details Modal --- */}
      {isFlagModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-red-700">Flag Reports</h3>
              <button 
                onClick={() => setIsFlagModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 font-bold text-xl"
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="mb-4 bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-100">
                <span className="font-bold">Note:</span> These reports were submitted by buyers regarding your orders. Buyer identities are kept anonymous to prevent retaliation.
              </div>

              {flags.map((flag, index) => (
                <div key={flag._id || index} className="bg-gray-50 border border-gray-200 rounded p-4 mb-3 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      Report #{index + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(flag.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 uppercase font-semibold">Reason:</span>
                    <p className="text-gray-800 text-sm italic mt-1">"{flag.reason}"</p>
                  </div>

                  <div className="mt-2 text-xs flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-bold capitalize ${flag.status === 'resolved' ? 'text-green-600' : 'text-red-500'}`}>
                      {flag.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 text-right">
              <button 
                onClick={() => setIsFlagModalOpen(false)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;