import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getImageUrl } from '../services/api';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const { user } = useAuth();

  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Collectibles'];

  useEffect(() => {
    fetchProducts();
  }, [page, category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        ...(category && { category }),
        ...(search && { search }),
      };
      const response = await getProducts(params);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
    setLoading(false);
  };

  // Hide the currently logged-in seller's own products from the public
  // catalog; they will still appear under "My Products".
  const visibleProducts = useMemo(() => {
    if (!user) return products;
    return products.filter((p) => p.seller_id !== user.id);
  }, [products, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Browse Products</h1>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading products...</div>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600">No products found</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {(() => {
                      const images = Array.isArray(product.images) ? product.images : [];
                      const primaryImage =
                        images[0] ||
                        product.image_url ||
                        'https://via.placeholder.com/300x200?text=No+Image';
                      return (
                        <img
                          src={getImageUrl(primaryImage)}
                          alt={product.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                      );
                    })()}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 truncate">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-bold text-xl">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">{product.category}</span>
                    </div>
                    {product.sale_type === 'auction' && (
                      <span className="inline-block mt-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        Auction
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
