import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProductById, createOrder } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialProductId = searchParams.get('productId');
  const initialQuantity = parseInt(searchParams.get('quantity') || '1', 10);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(!!initialProductId);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    quantity: initialQuantity > 0 ? initialQuantity : 1,
    street: '',
    city: '',
    state: '',
    zip: '',
    paymentMethod: 'cod'
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!initialProductId) {
        setLoading(false);
        return;
      }
      try {
        const res = await getProductById(initialProductId);
        setProduct(res.data.product);
      } catch (err) {
        console.error('Failed to load product for checkout:', err);
        setError('Could not load product details for checkout.');
      }
      setLoading(false);
    };

    fetchProduct();
  }, [initialProductId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPlacing(true);

    try {
      const quantity = parseInt(formData.quantity || 1, 10);
      await createOrder({
        productId: product.id,
        quantity,
        paymentMethod: formData.paymentMethod,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip
        }
      });
      setSuccess('Order placed successfully with Cash on Delivery.');
      setTimeout(() => navigate('/orders'), 1500);
    } catch (err) {
      console.error('Failed to place order:', err);
      setError(err.response?.data?.error || 'Failed to place order');
    }

    setPlacing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading checkout...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">No product selected for checkout.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <p className="font-semibold mb-1">{product.title}</p>
            <p className="text-sm text-gray-600 mb-2">{product.category}</p>
            <p className="text-lg font-bold text-blue-600 mb-4">
              ${parseFloat(product.price).toFixed(2)} each
            </p>
            <p className="text-sm text-gray-600">
              Sold by <span className="font-semibold">{product.seller_name}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                min="1"
                max={product.stock}
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Shipping Address
              </label>
              <input
                type="text"
                name="street"
                placeholder="Street address"
                value={formData.street}
                onChange={handleChange}
                required
                className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  name="zip"
                  placeholder="ZIP"
                  value={formData.zip}
                  onChange={handleChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="cod">Cash on Delivery</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Pay in cash when your order is delivered. No online payment required.
              </p>
            </div>

            <button
              type="submit"
              disabled={placing}
              className="w-full mt-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
            >
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

