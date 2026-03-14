import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSellerProducts, getSellerAuctions, getSellerOrders } from '../services/api';
import { FiPackage, FiDollarSign, FiTrendingUp, FiPlus } from 'react-icons/fi';

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalAuctions: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, auctionsRes, ordersRes] = await Promise.all([
        getSellerProducts({ limit: 1 }),
        getSellerAuctions({ limit: 1 }),
        getSellerOrders({ limit: 5, status: 'pending' }),
      ]);

      setStats({
        totalProducts: productsRes.data.pagination.total,
        totalAuctions: auctionsRes.data.pagination.total,
        pendingOrders: ordersRes.data.pagination.total,
      });

      setRecentOrders(ordersRes.data.orders);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <Link
            to="/seller/add-product"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FiPlus className="mr-2" />
            Add Product
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Products</p>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
              </div>
              <FiPackage className="text-4xl text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Auctions</p>
                <p className="text-3xl font-bold">{stats.totalAuctions}</p>
              </div>
              <FiTrendingUp className="text-4xl text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Pending Orders</p>
                <p className="text-3xl font-bold">{stats.pendingOrders}</p>
              </div>
              <FiDollarSign className="text-4xl text-green-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              to="/seller/products"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 text-center"
            >
              <FiPackage className="text-3xl mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">My Products</p>
            </Link>
            <Link
              to="/seller/auctions"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 text-center"
            >
              <FiTrendingUp className="text-3xl mx-auto mb-2 text-purple-600" />
              <p className="font-semibold">My Auctions</p>
            </Link>
            <Link
              to="/seller/orders"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 text-center"
            >
              <FiDollarSign className="text-3xl mx-auto mb-2 text-green-600" />
              <p className="font-semibold">Orders</p>
            </Link>
            <Link
              to="/seller/add-product"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 text-center"
            >
              <FiPlus className="text-3xl mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">Add Product</p>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-600">No pending orders</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Order ID</th>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Buyer</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="px-4 py-3">#{order.id}</td>
                      <td className="px-4 py-3">{order.product_title}</td>
                      <td className="px-4 py-3">{order.buyer_name}</td>
                      <td className="px-4 py-3 font-semibold">
                        ${parseFloat(order.total_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
