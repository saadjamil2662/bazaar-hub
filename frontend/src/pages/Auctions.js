import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuctions, getImageUrl } from '../services/api';
import { FiClock } from 'react-icons/fi';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('active');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchAuctions();
  }, [page, status]);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const response = await getAuctions({ page, limit: 20, status });
      setAuctions(response.data.auctions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    }
    setLoading(false);
  };

  const getTimeRemaining = (endTime) => {
    const total = Date.parse(endTime) - Date.parse(new Date());
    if (total <= 0) return 'Ended';

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Live Auctions</h1>

        {/* Status Filter */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setStatus('active');
                setPage(1);
              }}
              className={`px-6 py-2 rounded-lg ${
                status === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Active Auctions
            </button>
            <button
              onClick={() => {
                setStatus('ended');
                setPage(1);
              }}
              className={`px-6 py-2 rounded-lg ${
                status === 'ended'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Ended Auctions
            </button>
          </div>
        </div>

        {/* Auctions Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading auctions...</div>
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600">No auctions found</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {auctions.map((auction) => {
                const images = Array.isArray(auction.images) ? auction.images : [];
                const primaryImage =
                  images[0] ||
                  auction.image_url ||
                  'https://via.placeholder.com/300x200?text=No+Image';

                return (
                  <Link
                    key={auction.id}
                    to={`/auctions/${auction.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                      <img
                        src={getImageUrl(primaryImage)}
                        alt={auction.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                      {status === 'active' && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          LIVE
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 truncate">
                        {auction.title}
                      </h3>
                      <div className="mb-2">
                        <div className="text-sm text-gray-600">Current Bid</div>
                        <div className="text-blue-600 font-bold text-2xl">
                          ${parseFloat(auction.current_bid).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <FiClock className="mr-1" />
                        {getTimeRemaining(auction.end_time)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {auction.bid_count || 0} bid{auction.bid_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </Link>
                );
              })}
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

export default Auctions;
