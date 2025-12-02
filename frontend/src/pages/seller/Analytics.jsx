import React, { useEffect, useState } from 'react';
import { getOrders } from '../../api/orders';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const calculateAnalytics = async () => {
      try {
        const res = await getOrders();
        const orders = res.orders || res;

        // 1. Calculate Revenue Status Breakdown
        const revenueByStatus = {
          delivered: 0,
          pending: 0,
          cancelled: 0
        };

        // 2. Sales by Product (Top Sellers)
        const productSales = {};

        orders.forEach(order => {
          // Revenue
          if (order.status === 'delivered') revenueByStatus.delivered += order.totalPrice;
          else if (order.status === 'pending' || order.status === 'shipping') revenueByStatus.pending += order.totalPrice;
          else if (order.status === 'cancelled') revenueByStatus.cancelled += order.totalPrice;

          // Product Frequency
          if (order.status !== 'cancelled') {
            order.products.forEach(item => {
              const title = item.productId?.title || 'Unknown';
              productSales[title] = (productSales[title] || 0) + item.quantity;
            });
          }
        });

        // Convert Product Map to Array and Sort
        const topProducts = Object.entries(productSales)
          .map(([name, qty]) => ({ name, qty }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5); // Top 5

        setData({ revenueByStatus, topProducts, totalOrders: orders.length });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    calculateAnalytics();
  }, []);

  if (loading) return <LoadingSpinner />;

  // --- Simple CSS/SVG Chart Component ---
  const BarChart = ({ data }) => {
    const maxVal = Math.max(...data.map(d => d.value));
    return (
      <div className="flex items-end justify-around h-40 pt-6 space-x-2">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center w-full group">
            <div className="relative w-full flex justify-center">
              {/* Tooltip on Hover */}
              <span className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                ${d.value.toFixed(0)}
              </span>
              {/* Bar */}
              <div 
                className={`w-12 rounded-t transition-all duration-500 ${d.color}`}
                style={{ height: `${maxVal > 0 ? (d.value / maxVal) * 120 : 0}px` }} // 120px max height
              ></div>
            </div>
            <span className="text-xs text-gray-500 mt-2 font-medium">{d.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const chartData = [
    { label: 'Settled', value: data.revenueByStatus.delivered, color: 'bg-green-500' },
    { label: 'Pending', value: data.revenueByStatus.pending, color: 'bg-blue-500' },
    { label: 'Lost', value: data.revenueByStatus.cancelled, color: 'bg-red-400' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Store Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Overview Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Revenue Breakdown</h3>
          <div className="border-b border-gray-100 mb-4"></div>
          {data.totalOrders === 0 ? (
            <p className="text-gray-400 text-center py-10">No data available yet</p>
          ) : (
            <BarChart data={chartData} />
          )}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Total Potential Revenue: <span className="font-bold text-gray-800">${(data.revenueByStatus.delivered + data.revenueByStatus.pending).toFixed(2)}</span></p>
          </div>
        </div>

        {/* Top Products List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Top Selling Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">Product Name</th>
                  <th className="px-4 py-2 text-right">Units Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.topProducts.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-4 text-gray-500">No sales yet</td></tr>
                ) : (
                  data.topProducts.map((p, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm text-gray-500">#{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">{p.qty}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Simple Text Summary */}
      <div className="bg-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-bold mb-2">Performance Insight</h3>
        <p className="opacity-90">
          You have processed a total of <strong>{data.totalOrders}</strong> orders. 
          {data.revenueByStatus.pending > 0 
            ? ` Keep it up! You have $${data.revenueByStatus.pending} currently in the pipeline.` 
            : " All orders are settled."}
        </p>
      </div>

    </div>
  );
};

export default Analytics;