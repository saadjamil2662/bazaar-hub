import React, { useEffect, useState } from 'react';
import { getSellerOrders, updateOrderStatus } from '../services/api';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSellerOrders({ page: 1, limit: 50, status: 'pending' });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch seller orders:', err);
      setError(err.response?.data?.error || 'Failed to load your orders');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    setError('');
    try {
      await updateOrderStatus(orderId, { status });
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError(err.response?.data?.error || 'Failed to update order status');
    }
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Seller Orders</h1>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
            You do not have any pending orders.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-bold">#{order.id}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Product: <span className="font-semibold">{order.product_title}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Buyer: <span className="font-semibold">{order.buyer_name}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-lg font-bold text-green-600">
                      ${parseFloat(order.total_price).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    {order.status}
                  </span>

                  <div className="space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'processing')}
                      disabled={updatingId === order.id}
                      className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Mark as Processing
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'shipped')}
                      disabled={updatingId === order.id}
                      className="px-3 py-1 text-sm rounded bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400"
                    >
                      Mark as Shipped
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      disabled={updatingId === order.id}
                      className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Mark as Delivered
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;

