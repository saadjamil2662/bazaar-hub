import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuctionById, placeBid, getAuctionBids, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket';
import { FiClock, FiUser } from 'react-icons/fi';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    fetchAuction();
    fetchBids();

    // Join auction room for real-time updates
    if (isAuthenticated) {
      socketService.joinAuction(id);

      socketService.onNewBid((data) => {
        setAuction(data.auction);
        fetchBids();
      });

      return () => {
        socketService.leaveAuction(id);
        socketService.removeListener('new_bid');
      };
    }
  }, [id, isAuthenticated]);

  // Update countdown timer
  useEffect(() => {
    if (!auction) return;

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(auction.end_time);
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  const fetchAuction = async () => {
    try {
      const response = await getAuctionById(id);
      setAuction(response.data.auction);
      setBidAmount((parseFloat(response.data.auction.current_bid) + 1).toFixed(2));
    } catch (error) {
      console.error('Failed to fetch auction:', error);
    }
    setLoading(false);
  };

  const fetchBids = async () => {
    try {
      const response = await getAuctionBids(id);
      setBids(response.data.bids);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    }
  };

  const calculateTimeRemaining = (endTime) => {
    const total = Date.parse(endTime) - Date.parse(new Date());
    if (total <= 0) return 'Auction Ended';

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setError('');
    setBidding(true);

    try {
      await placeBid(id, { bidAmount: parseFloat(bidAmount) });
      setBidAmount((parseFloat(bidAmount) + 1).toFixed(2));
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to place bid');
    }

    setBidding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading auction...</div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Auction not found</div>
      </div>
    );
  }

  const isEnded = new Date(auction.end_time) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Image and Description */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
              <div className="h-96 bg-gray-200 flex items-center justify-center">
                {auction.images && auction.images[0] ? (
                  <img
                    src={getImageUrl(auction.images[0])}
                    alt={auction.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                    }}
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-700">{auction.description}</p>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <strong>Category:</strong> {auction.category}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Seller:</strong> {auction.seller_name}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Bidding */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
              <h1 className="text-3xl font-bold mb-4">{auction.title}</h1>
              
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-1">Current Bid</div>
                <div className="text-4xl font-bold text-blue-600">
                  ${parseFloat(auction.current_bid).toFixed(2)}
                </div>
                {auction.highest_bidder_name && (
                  <div className="text-sm text-gray-600 mt-1">
                    Highest bidder: {auction.highest_bidder_name}
                  </div>
                )}
              </div>

              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center text-lg">
                  <FiClock className="mr-2" />
                  <span className="font-semibold">
                    {isEnded ? 'Auction Ended' : timeRemaining}
                  </span>
                </div>
              </div>

              {!isEnded && (
                <form onSubmit={handlePlaceBid} className="mb-6">
                  <label className="block text-sm font-semibold mb-2">
                    Place Your Bid
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min={parseFloat(auction.current_bid) + 0.01}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={bidding || !isAuthenticated}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {bidding ? 'Bidding...' : 'Place Bid'}
                    </button>
                  </div>
                  {error && (
                    <div className="mt-2 text-red-600 text-sm">{error}</div>
                  )}
                  {!isAuthenticated && (
                    <div className="mt-2 text-gray-600 text-sm">
                      Please <button onClick={() => navigate('/login')} className="text-blue-600 underline">login</button> to place a bid
                    </div>
                  )}
                </form>
              )}

              <div className="text-sm text-gray-600">
                <p>Starting Bid: ${parseFloat(auction.starting_bid).toFixed(2)}</p>
                <p>Total Bids: {auction.bid_count || 0}</p>
              </div>
            </div>

            {/* Bid History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Bid History</h2>
              {bids.length === 0 ? (
                <p className="text-gray-600">No bids yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bids.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div className="flex items-center">
                        <FiUser className="mr-2 text-gray-600" />
                        <span className="font-semibold">{bid.bidder_name}</span>
                      </div>
                      <div>
                        <div className="font-bold text-blue-600">
                          ${parseFloat(bid.amount).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(bid.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
