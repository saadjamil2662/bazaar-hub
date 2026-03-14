const Order = require('../models/Order');
const Product = require('../models/Product');
const Auction = require('../models/Auction');
const NotificationService = require('../services/notificationService');

class OrderController {
  static async createOrder(req, res) {
    try {
      const { productId, quantity, shippingAddress, paymentMethod } = req.body;
      const buyerId = req.user.userId;

      // Validation
      if (!productId || !quantity || !shippingAddress) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Prevent sellers from purchasing their own products
      if (product.seller_id === buyerId) {
        return res.status(400).json({ error: 'You cannot purchase your own product' });
      }

      if (product.sale_type !== 'fixed') {
        return res.status(400).json({ error: 'Product is not available for direct purchase' });
      }

      // Check stock
      const updatedProduct = await Product.decreaseStock(productId, quantity);
      if (!updatedProduct) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      const totalPrice = product.price * quantity;

      const order = await Order.create({
        buyerId,
        sellerId: product.seller_id,
        productId,
        quantity,
        totalPrice,
        shippingAddress,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
      });

      // Notify seller of new order
      try {
        await NotificationService.notifyNewOrder(
          product.seller_id,
          order.id
        );
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        // Don't fail the request if notifications fail
      }

      res.status(201).json({
        message: 'Order created successfully',
        order
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }

  static async createOrderFromAuction(req, res) {
    try {
      const { auctionId, shippingAddress } = req.body;
      const buyerId = req.user.userId;

      // Get auction
      const auction = await Auction.findById(auctionId);
      if (!auction) {
        return res.status(404).json({ error: 'Auction not found' });
      }

      // Check if auction ended
      if (new Date(auction.end_time) > new Date()) {
        return res.status(400).json({ error: 'Auction has not ended yet' });
      }

      // Check if user is highest bidder
      if (auction.highest_bidder_id !== buyerId) {
        return res.status(403).json({ error: 'You are not the highest bidder' });
      }

      // Check if already ordered
      const existingOrder = await Order.findByAuctionId(auctionId);
      if (existingOrder) {
        return res.status(400).json({ error: 'Order already exists for this auction' });
      }

      const order = await Order.createFromAuction({
        buyerId,
        sellerId: auction.seller_id,
        productId: auction.product_id,
        totalPrice: auction.current_bid,
        shippingAddress,
        auctionId
      });

      // Mark auction as ended
      await Auction.endAuction(auctionId);

      // Send notifications
      try {
        // Notify winner
        await NotificationService.notifyAuctionWon(
          buyerId,
          auction.title,
          auction.current_bid
        );

        // Notify seller of winning bid
        await NotificationService.notifyNewOrder(
          auction.seller_id,
          order.id
        );
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        // Don't fail the request if notifications fail
      }

      res.status(201).json({
        message: 'Order created successfully',
        order
      });
    } catch (error) {
      console.error('Create order from auction error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }

  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check authorization
      if (order.buyer_id !== req.user.userId && order.seller_id !== req.user.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      res.json({ order });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Failed to get order' });
    }
  }

  static async getBuyerOrders(req, res) {
    try {
      const { page, limit } = req.query;
      const buyerId = req.user.userId;

      const result = await Order.findByBuyer(buyerId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });

      res.json(result);
    } catch (error) {
      console.error('Get buyer orders error:', error);
      res.status(500).json({ error: 'Failed to get orders' });
    }
  }

  static async getSellerOrders(req, res) {
    try {
      const { page, limit, status } = req.query;
      const sellerId = req.user.userId;

      const result = await Order.findBySeller(sellerId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status
      });

      res.json(result);
    } catch (error) {
      console.error('Get seller orders error:', error);
      res.status(500).json({ error: 'Failed to get orders' });
    }
  }

  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const sellerId = req.user.userId;

      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const order = await Order.updateStatus(id, sellerId, status);

      if (!order) {
        return res.status(404).json({ error: 'Order not found or unauthorized' });
      }

      res.json({
        message: 'Order status updated successfully',
        order
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }

  static async addTracking(req, res) {
    try {
      const { id } = req.params;
      const { trackingNumber } = req.body;
      const sellerId = req.user.userId;

      if (!trackingNumber) {
        return res.status(400).json({ error: 'Tracking number required' });
      }

      const order = await Order.addTracking(id, sellerId, trackingNumber);

      if (!order) {
        return res.status(404).json({ error: 'Order not found or unauthorized' });
      }

      // Notify buyer that order has been shipped
      try {
        await NotificationService.notifyOrderShipped(
          order.buyer_id,
          order.id,
          trackingNumber
        );
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        // Don't fail the request if notifications fail
      }

      res.json({
        message: 'Tracking information added successfully',
        order
      });
    } catch (error) {
      console.error('Add tracking error:', error);
      res.status(500).json({ error: 'Failed to add tracking' });
    }
  }
}

module.exports = OrderController;
