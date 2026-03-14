const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// we no longer restrict endpoints by role. every authenticated user
// should be able to buy and sell from the same account. the old
// `sellerOnly` middleware used to check `req.user.role` and reject
// non-sellers, but the front‑end now treats every logged in user as a
// potential seller, so this helper simply forwards the request.
const sellerOnly = (req, res, next) => {
  // previously: if (req.user.role !== 'seller') return res.status(403).json({ error: 'Seller access only' });
  next();
};

module.exports = { authMiddleware, sellerOnly };
