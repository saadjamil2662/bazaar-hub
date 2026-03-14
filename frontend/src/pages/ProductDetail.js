import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getProductReviews, addProductReview, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiBox, FiTag, FiMessageCircle } from 'react-icons/fi';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await getProductById(id);
      setProduct(response.data.product);
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('Product not found');
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    try {
      const response = await getProductReviews(id);
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setError('');
    setSuccess('');
    setOrdering(true);

    // Redirect into the dedicated checkout flow so the buyer can
    // provide a real address and confirm Cash on Delivery.
    navigate(`/checkout?productId=${product.id}&quantity=${quantity}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Product not found</div>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const safeSelectedIndex = Math.min(selectedImageIndex, Math.max(images.length - 1, 0));
  const activeImage = images[safeSelectedIndex];
  const isOwner = user && product.seller_id === user.id;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length
      : null;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSubmitting(true);
    try {
      await addProductReview(product.id, { rating, comment });
      setComment('');
      await fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    }
    setReviewSubmitting(false);
  };

  const showNextImage = () => {
    if (images.length < 2) return;
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const showPrevImage = () => {
    if (images.length < 2) return;
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.changedTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX - touchEndX;
    const swipeThreshold = 40;

    if (deltaX > swipeThreshold) {
      showNextImage();
    } else if (deltaX < -swipeThreshold) {
      showPrevImage();
    }

    setTouchStartX(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate('/products')}
          className="mb-6 text-blue-600 hover:underline"
        >
          &larr; Back to Products
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
              <div
                className="h-96 bg-gray-200 flex items-center justify-center relative"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {images.length > 0 ? (
                  <>
                    <img
                      src={getImageUrl(activeImage)}
                      alt={`${product.title} ${safeSelectedIndex + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                      }}
                    />

                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={showPrevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full"
                          aria-label="Previous image"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={showNextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full"
                          aria-label="Next image"
                        >
                          ›
                        </button>
                        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {safeSelectedIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={getImageUrl(img)}
                    alt={`Product ${idx}`}
                    className={`h-20 w-full object-cover rounded cursor-pointer border-2 ${
                      safeSelectedIndex === idx
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-blue-500'
                    }`}
                    onClick={() => setSelectedImageIndex(idx)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details and actions */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-1">Price</p>
                <p className="text-4xl font-bold text-blue-600">
                  ${parseFloat(product.price).toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center p-3 bg-gray-100 rounded">
                  <FiTag className="text-blue-600 mr-3" />
                  <div>
                    <p className="text-xs text-gray-600">Category</p>
                    <p className="font-semibold">{product.category}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-100 rounded">
                  <FiBox className="text-blue-600 mr-3" />
                  <div>
                    <p className="text-xs text-gray-600">Stock</p>
                    <p className="font-semibold">
                      {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-1">Seller</p>
                <p className="font-semibold">{product.seller_name}</p>
                <p className="text-gray-600 text-sm">{product.seller_email}</p>
              </div>

              <div className="mb-6 p-4 bg-gray-100 rounded">
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-700">{product.description}</p>
              </div>

              {!isOwner && isAuthenticated && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/chat?userId=${product.seller_id}&name=${encodeURIComponent(
                        product.seller_name || 'Seller'
                      )}&productId=${product.id}`
                    )
                  }
                  className="mb-4 w-full bg-white border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 font-semibold flex items-center justify-center"
                >
                  <FiMessageCircle className="mr-2" />
                  Message Seller
                </button>
              )}

              {product.stock > 0 && !isOwner && (
                <form onSubmit={handleAddToCart} className="space-y-4">
                  {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                      {success}
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={ordering || !isAuthenticated}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold flex items-center justify-center"
                  >
                    <FiShoppingCart className="mr-2" />
                    {ordering ? 'Redirecting...' : 'Proceed to Checkout'}
                  </button>

                  {!isAuthenticated && (
                    <p className="text-center text-gray-600 text-sm">
                      Please{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-blue-600 underline"
                      >
                        login
                      </button>{' '}
                      to place an order
                    </p>
                  )}
                </form>
              )}

              {isOwner && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-3">
                  You are the seller of this product. It is hidden from your public catalog and cannot be purchased from this view.
                </div>
              )}

              {product.stock === 0 && !isOwner && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  This product is currently out of stock
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
            {averageRating && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Average rating:{' '}
                  <span className="font-semibold">
                    {averageRating.toFixed(1)} / 5 ({reviews.length} review
                    {reviews.length === 1 ? '' : 's'})
                  </span>
                </p>
              </div>
            )}
            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews yet. Be the first to review this product.</p>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">
                        {review.user_name || 'Anonymous'}
                      </span>
                      <span className="text-yellow-500 text-sm">
                        {'★'.repeat(review.rating)}{' '}
                        <span className="text-gray-500">
                          {review.rating}/5
                        </span>
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Leave a Review</h2>
            {!isAuthenticated && (
              <p className="text-gray-600 text-sm mb-2">
                Please{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 underline"
                >
                  login
                </button>{' '}
                to leave a review.
              </p>
            )}
            {isOwner && (
              <p className="text-yellow-800 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded text-sm mb-3">
                You cannot review your own product.
              </p>
            )}
            {reviewError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3">
                {reviewError}
              </div>
            )}
            <form
              onSubmit={handleSubmitReview}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value, 10))}
                  disabled={!isAuthenticated || isOwner}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} - {r === 5 ? 'Excellent' : r === 4 ? 'Good' : r === 3 ? 'Average' : r === 2 ? 'Poor' : 'Terrible'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Comment (optional)
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={!isAuthenticated || isOwner}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={!isAuthenticated || isOwner || reviewSubmitting}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
