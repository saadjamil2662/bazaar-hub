import React, { useState, useEffect } from 'react';
import { getBuyerOrders } from '../services/api';
import { FiPackage, FiCalendar, FiTruck } from 'react-icons/fi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getBuyerOrders({ page, limit: 10 });
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FiPackage className="text-5xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No orders yet</p>
            <p className="text-gray-500">Start shopping to place your first order</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="grid md:grid-cols-4 gap-4 items-start">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="text-lg font-bold">#{order.id}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Product</p>
                      <p className="font-semibold">{order.product_title}</p>
                      <p className="text-sm text-gray-600">
                        Seller: {order.seller_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-lg font-bold text-green-600">
                        ${parseFloat(order.total_price).toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>

                    {order.tracking_number && (
                      <div className="flex items-center">
                        <FiTruck className="mr-2" />
                        Track: {order.tracking_number}
                      </div>
                    )}

                    {order.shipping_address && (
                      <div>
                        <p className="text-xs">
                          Shipping: {order.shipping_address.street}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-3 py-1 text-gray-600">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => setPage(pagination.totalPages)}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
