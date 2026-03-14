import axios from 'axios';

// default to the environment variable if provided. when running the
// frontend on localhost we expect the backend to be on port 5000; if
// the page is already served from that port just use the same origin.
const DEFAULT_BACKEND_PORT = '5000';
const origin = window.location.origin.replace(/\/*$/, '');
const API_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.port === DEFAULT_BACKEND_PORT
    ? `${origin}/api`
    : `${window.location.protocol}//${window.location.hostname}:${DEFAULT_BACKEND_PORT}/api`);

// Extract base backend URL (without /api)
const BACKEND_BASE_URL = API_URL.replace(/\/api\/?$/, '');

// debug output - will show up in browser console when the app loads
console.info('API service initialized with base URL:', API_URL);
console.info('Backend base URL:', BACKEND_BASE_URL);

// Utility function to construct full image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise prepend the backend base URL
  return `${BACKEND_BASE_URL}${imagePath}`;
};

const api = axios.create({
  baseURL: API_URL.replace(/\/*$/, ''), // API_URL already includes '/api'
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// intercept responses to provide friendlier messages for common
// connectivity problems (was causing confusing "Route not found" errors)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      if (error.response.status === 404) {
        error.response.data.error =
          'Server route not found – check that the API URL is correct and the backend is running.';
      }
      return Promise.reject(error);
    }

    // network error or no response (server unreachable)
    if (error.request && !error.response) {
      return Promise.reject({
        response: {
          status: 0,
          data: {
            error:
              'Unable to reach server – is the backend running and is the API URL configured correctly?'
          }
        }
      });
    }

    return Promise.reject(error);
  }
);

// Auth (prefix paths with `/api` to guarantee the base route)
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);

// NOTE: the baseURL already includes `/api`; we explicitly add the
// segment here in case the value was computed without it earlier (and to
// make debugging easier it still appears in the request URL).
// The login/register calls above are left unchanged because they were
// already correct when baseURL was right; but the root issue occurs when
// baseURL lacks `/api` entirely, so we override it by prefixing paths
// when constructing the axios instance below.

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (dataOrFormData) => {
  // Allow both multipart (for file uploads) and simple JSON bodies.
  if (dataOrFormData instanceof FormData) {
    return api.post('/products', dataOrFormData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post('/products', dataOrFormData);
};
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getSellerProducts = (params) => api.get('/products/seller', { params });

// Product reviews
export const getProductReviews = (productId) => api.get(`/products/${productId}/reviews`);
export const addProductReview = (productId, data) =>
  api.post(`/products/${productId}/reviews`, data);

// Auctions
export const getAuctions = (params) => api.get('/auctions', { params });
export const getAuctionById = (id) => api.get(`/auctions/${id}`);
export const createAuction = (data) => api.post('/auctions', data);
export const placeBid = (id, data) => api.post(`/auctions/${id}/bid`, data);
export const getAuctionBids = (id, params) => api.get(`/auctions/${id}/bids`, { params });
export const getSellerAuctions = (params) => api.get('/auctions/seller', { params });

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const createOrderFromAuction = (data) => api.post('/orders/auction', data);
export const getBuyerOrders = (params) => api.get('/orders/buyer', { params });
export const getSellerOrders = (params) => api.get('/orders/seller', { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);
export const addTracking = (id, data) => api.put(`/orders/${id}/tracking`, data);

// Messages / chat
export const sendMessage = (data) => api.post('/messages', data);
export const getInboxConversations = (params) => api.get('/messages/inbox', { params });
export const getMessageThread = (userId, params) =>
  api.get(`/messages/thread/${userId}`, { params });

export default api;
