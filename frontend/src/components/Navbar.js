import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiUser, FiLogOut, FiPackage } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            🛍️ Bazaar Hub
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/products" className="hover:text-blue-200">
              Products
            </Link>
            <Link to="/auctions" className="hover:text-blue-200">
              Auctions
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/seller/dashboard" className="hover:text-blue-200">
                  Seller Dashboard
                </Link>
                <Link to="/orders" className="hover:text-blue-200 flex items-center">
                  <FiPackage className="mr-1" />
                  My Orders
                </Link>
                <Link to="/chat" className="hover:text-blue-200">
                  Inbox
                </Link>
                <Link to="/profile" className="hover:text-blue-200 flex items-center">
                  <FiUser className="mr-1" />
                  {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:text-blue-200 flex items-center"
                >
                  <FiLogOut className="mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
