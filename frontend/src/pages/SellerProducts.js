import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteProduct,
  getImageUrl,
  getProductReviews,
  getSellerProducts,
  updateProduct
} from '../services/api';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });
  const [savingProductId, setSavingProductId] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [reviewsByProduct, setReviewsByProduct] = useState({});
  const [loadingReviewsByProduct, setLoadingReviewsByProduct] = useState({});

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSellerProducts({ page: 1, limit: 50 });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to fetch seller products:', err);
      setError(err.response?.data?.error || 'Failed to load your products');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const beginEdit = (product) => {
    setEditingProductId(product.id);
    setEditForm({
      title: product.title || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      stock: product.stock ?? 0
    });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setEditForm({ title: '', description: '', price: '', category: '', stock: '' });
  };

  const saveEdit = async (productId) => {
    setSavingProductId(productId);
    setError('');
    try {
      await updateProduct(productId, {
        title: editForm.title,
        description: editForm.description,
        price: editForm.price,
        category: editForm.category,
        stock: editForm.stock
      });

      setProducts((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, ...editForm } : item))
      );
      cancelEdit();
    } catch (err) {
      console.error('Failed to update product:', err);
      setError(err.response?.data?.error || 'Failed to update product');
    }
    setSavingProductId(null);
  };

  const removeProduct = async (productId) => {
    const confirmed = window.confirm('Delete this product from your listings?');
    if (!confirmed) return;

    setDeletingProductId(productId);
    setError('');
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((item) => item.id !== productId));
      if (editingProductId === productId) {
        cancelEdit();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError(err.response?.data?.error || 'Failed to delete product');
    }
    setDeletingProductId(null);
  };

  const toggleReviews = async (productId) => {
    if (reviewsByProduct[productId]) {
      setReviewsByProduct((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      return;
    }

    setLoadingReviewsByProduct((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await getProductReviews(productId);
      setReviewsByProduct((prev) => ({ ...prev, [productId]: res.data.reviews || [] }));
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError(err.response?.data?.error || 'Failed to load product reviews');
    }
    setLoadingReviewsByProduct((prev) => ({ ...prev, [productId]: false }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading your products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Products</h1>
          <Link
            to="/seller/add-product"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Add Product
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
            You have not added any products yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const images = Array.isArray(product.images) ? product.images : [];
              const primaryImage =
                images[0] ||
                product.image_url ||
                'https://via.placeholder.com/300x200?text=No+Image';

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="h-40 bg-gray-200">
                    <img
                      src={getImageUrl(primaryImage)}
                      alt={product.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    {editingProductId === product.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          placeholder="Title"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          rows={3}
                          placeholder="Description"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, price: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            placeholder="Price"
                          />
                          <input
                            type="number"
                            min="0"
                            value={editForm.stock}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, stock: e.target.value }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            placeholder="Stock"
                          />
                        </div>
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, category: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          placeholder="Category"
                        />

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(product.id)}
                            disabled={savingProductId === product.id}
                            className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                          >
                            {savingProductId === product.id ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded text-sm hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg mb-1 truncate">{product.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 truncate">{product.category}</p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-blue-600 font-bold text-xl">
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Stock: {product.stock ?? 0}
                          </span>
                        </div>

                        <div className="flex gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => beginEdit(product)}
                            className="flex-1 bg-white border border-blue-600 text-blue-600 py-2 rounded text-sm hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            disabled={deletingProductId === product.id}
                            className="flex-1 bg-white border border-red-600 text-red-600 py-2 rounded text-sm hover:bg-red-50 disabled:opacity-60"
                          >
                            {deletingProductId === product.id ? 'Removing...' : 'Remove'}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleReviews(product.id)}
                          className="w-full bg-gray-100 text-gray-700 py-2 rounded text-sm hover:bg-gray-200"
                        >
                          {reviewsByProduct[product.id] ? 'Hide Reviews' : 'View Reviews'}
                        </button>

                        {loadingReviewsByProduct[product.id] && (
                          <p className="text-xs text-gray-500 mt-2">Loading reviews...</p>
                        )}

                        {reviewsByProduct[product.id] && (
                          <div className="mt-3 border-t pt-3 space-y-2 max-h-48 overflow-y-auto">
                            {reviewsByProduct[product.id].length === 0 ? (
                              <p className="text-xs text-gray-500">No reviews yet.</p>
                            ) : (
                              reviewsByProduct[product.id].map((review) => (
                                <div key={review.id} className="bg-gray-50 rounded p-2">
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <span className="font-semibold text-gray-700">
                                      {review.user_name || 'Anonymous'}
                                    </span>
                                    <span className="text-yellow-600">
                                      {'★'.repeat(review.rating)}
                                    </span>
                                  </div>
                                  {review.comment && (
                                    <p className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                                      {review.comment}
                                    </p>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;

