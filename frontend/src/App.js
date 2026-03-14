import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import SellerDashboard from './pages/SellerDashboard';
import Checkout from './pages/Checkout';
import SellerProducts from './pages/SellerProducts';
import SellerAuctions from './pages/SellerAuctions';
import SellerOrders from './pages/SellerOrders';
import AddProduct from './pages/AddProduct';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

// Protected route wrapper. the `sellerOnly` flag is kept for
// backward compatibility but it no longer limits access: every logged
// in user can reach seller pages.
const ProtectedRoute = ({ children, sellerOnly = false }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // we intentionally do *not* check the user's role here; all
  // authenticated accounts may buy and sell.
  return children;
};

function AppRoutes() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/auctions/:id" element={<AuctionDetail />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products"
            element={
              <ProtectedRoute>
                <SellerProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/auctions"
            element={
              <ProtectedRoute>
                <SellerAuctions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute>
                <SellerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/add-product"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
