const Auction = require('../models/Auction');
const Product = require('../models/Product');
const NotificationService = require('../services/notificationService');

class AuctionController {
  static async createAuction(req, res) {
    try {
      const { productId, startingBid, durationHours } = req.body;
      const sellerId = req.user.userId;

      // Validation
      if (!productId || !startingBid || !durationHours) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Starting bid validation
      const bidNum = parseFloat(startingBid);
      if (isNaN(bidNum) || bidNum < 0.01) {
        return res.status(400).json({ error: 'Starting bid must be a positive number' });
      }

      // Duration validation
      const durationNum = parseInt(durationHours);
      if (isNaN(durationNum) || durationNum < 1 || durationNum > 720) {
        return res.status(400).json({ error: 'Duration must be between 1 and 720 hours' });
      }

      // Verify product ownership
      const product = await Product.findById(productId);
      if (!product || product.seller_id !== sellerId) {
        return res.status(403).json({ error: 'Product not found or unauthorized' });
      }

      if (product.sale_type !== 'auction') {
        return res.status(400).json({ error: 'Product is not set for auction' });
      }

      // Calculate end time
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + durationNum);

      const auction = await Auction.create({
        productId,
        startingBid: bidNum,
        currentBid: bidNum,
        endTime,
        sellerId
      });

      res.status(201).json({
        message: 'Auction created successfully',
        auction
      });
    } catch (error) {
      console.error('Create auction error:', error);
      res.status(500).json({ error: 'Failed to create auction' });
    }
  }

  static async getAuctions(req, res) {
    try {
      const { page, limit, status, category, search } = req.query;

      const result = await Auction.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status: status || 'active',
        category,
        search
      });

      res.json(result);
    } catch (error) {
      console.error('Get auctions error:', error);
      res.status(500).json({ error: 'Failed to get auctions' });
    }
  }

  static async getAuctionById(req, res) {
    try {
      const { id } = req.params;
      const auction = await Auction.findById(id);

      if (!auction) {
        return res.status(404).json({ error: 'Auction not found' });
      }

      res.json({ auction });
    } catch (error) {
      console.error('Get auction error:', error);
      res.status(500).json({ error: 'Failed to get auction' });
    }
  }

  static async placeBid(req, res) {
    try {
      const { id } = req.params;
      const { bidAmount } = req.body;
      const userId = req.user.userId;

      if (!bidAmount) {
        return res.status(400).json({ error: 'Bid amount is required' });
      }

      const bidNum = parseFloat(bidAmount);
      if (isNaN(bidNum) || bidNum <= 0) {
        return res.status(400).json({ error: 'Invalid bid amount' });
      }

      const result = await Auction.placeBid(id, userId, bidNum);

      // Emit socket event for real-time update (handled in socket service)
      const io = req.app.get('io');
      if (io) {
        io.to(`auction_${id}`).emit('new_bid', {
          auction: result.auction,
          bid: result.bid
        });
      }

      // Send notifications
      try {
        // Notify seller of new bid
        await NotificationService.notifyNewBid(
          result.auction.seller_id,
          result.auction.title,
          bidNum
        );

        // Notify previous highest bidder they've been outbid
        if (result.auction.highest_bidder_id && result.auction.highest_bidder_id !== userId) {
          // Find the previous highest bidder to notify them
          await NotificationService.notifyAuctionLost(
            result.auction.highest_bidder_id,
            result.auction.title
          );
        }
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        // Don't fail the request if notifications fail
      }

      res.json({
        message: 'Bid placed successfully',
        ...result
      });
    } catch (error) {
      console.error('Place bid error:', error);
      res.status(400).json({ error: error.message || 'Failed to place bid' });
    }
  }

  static async getAuctionBids(req, res) {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;

      const result = await Auction.getAuctionBids(id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });

      res.json(result);
    } catch (error) {
      console.error('Get auction bids error:', error);
      res.status(500).json({ error: 'Failed to get bids' });
    }
  }

  static async getSellerAuctions(req, res) {
    try {
      const { page, limit } = req.query;
      const sellerId = req.user.userId;

      const result = await Auction.findBySeller(sellerId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });

      res.json(result);
    } catch (error) {
      console.error('Get seller auctions error:', error);
      res.status(500).json({ error: 'Failed to get auctions' });
    }
  }
}

module.exports = AuctionController;
