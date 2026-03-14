const express = require('express');
const router = express.Router();
const AuctionController = require('../controllers/auctionController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, AuctionController.createAuction);
router.get('/', AuctionController.getAuctions);
router.get('/seller', authMiddleware, AuctionController.getSellerAuctions);
router.get('/:id', AuctionController.getAuctionById);
router.post('/:id/bid', authMiddleware, AuctionController.placeBid);
router.get('/:id/bids', AuctionController.getAuctionBids);

module.exports = router;
