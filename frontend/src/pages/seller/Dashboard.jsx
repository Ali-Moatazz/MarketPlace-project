import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { getOrders } from '../../api/orders';
import { getAllProducts } from '../../api/products';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrders: 0,
    totalProducts: 0,
    pendingShipments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Parallel data fetching
      const [ordersData, productsData] = await Promise.all([
        getOrders(),       // Backend filters this for the specific seller
        getAllProducts()   // Returns ALL products (we need to filter client-side)
      ]);

      // Filter products for this seller
      const myProducts = (productsData.products || productsData).filter(
        p => p.sellerId?._id === user.id || p.sellerId === user.id
      );

      // Calculate Stats
      const activeOrders = (ordersData.orders || ordersData).filter(o => o.status !== 'cancelled' && o.status !== 'delivered');
      const sales = (ordersData.orders || ordersData)
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      
      const pending = activeOrders.filter(o => o.status === 'pending').length;

      setStats({
        totalSales: sales,
        activeOrders: activeOrders.length,
        totalProducts: myProducts.length,
        pendingShipments: pending
      });
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
      
      {/* KPI Cards Grid */}
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Seller Rating:</span>
            <span className="font-medium text-yellow-600">★ {user.rating_seller || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;