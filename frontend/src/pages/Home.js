import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Bazaar Hub</h1>
          <p className="text-xl mb-8">
            Buy and sell unique items, or join live auctions in one modern marketplace.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/products"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Shop Now
            </Link>
            <Link
              to="/auctions"
              className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600"
            >
              Browse Auctions
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Bazaar Hub?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FiShoppingBag className="text-5xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
            <p className="text-gray-600">
              Thousands of products across multiple categories
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FiDollarSign className="text-5xl text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
            <p className="text-gray-600">
              Competitive fixed prices and exciting auction deals
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FiTrendingUp className="text-5xl text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-Time Bidding</h3>
            <p className="text-gray-600">
              Live auction updates with WebSocket technology
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Buying and Selling?</h2>
          <p className="text-xl mb-8">
            Join Bazaar Hub today to list your items or discover great deals from other sellers.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Buy and Sell on Bazaar Hub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
