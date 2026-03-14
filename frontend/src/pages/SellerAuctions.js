import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSellerAuctions, getImageUrl } from '../services/api';

const SellerAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getSellerAuctions({ page: 1, limit: 50 });
        setAuctions(res.data.auctions || []);
      } catch (err) {
        console.error('Failed to fetch seller auctions:', err);
        setError(err.response?.data?.error || 'Failed to load your auctions');
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading your auctions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Auctions</h1>
          <Link
            to="/seller/add-product"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold"
          >
            Create Auction Product
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {auctions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
            You do not have any auctions yet.
          </div>
        ) : (
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
                  <div className="h-40 bg-gray-200">
                    <img
                      src={getImageUrl(primaryImage)}
                      alt={auction.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{auction.title}</h3>
                    <div className="text-sm text-gray-600 mb-1">Current Bid</div>
                    <div className="text-blue-600 font-bold text-xl mb-1">
                      ${parseFloat(auction.current_bid).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {auction.bid_count || 0} bid{auction.bid_count === 1 ? '' : 's'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerAuctions;

