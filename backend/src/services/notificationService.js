const { redisClient } = require('../config/redis');

class NotificationService {
  static async createNotification(userId, message, type = 'info', data = {}) {
    try {
      const notification = {
        id: Date.now().toString(),
        userId,
        message,
        type, // 'info', 'success', 'warning', 'error'
        data,
        read: false,
        createdAt: new Date().toISOString()
      };

      // Store in Redis with expiration (7 days)
      const key = `notifications:${userId}`;
      await redisClient.lPush(key, JSON.stringify(notification));
      await redisClient.expire(key, 7 * 24 * 60 * 60); // 7 days

      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId, limit = 50) {
    try {
      const key = `notifications:${userId}`;
      const notifications = await redisClient.lRange(key, 0, limit - 1);
      return notifications.map(n => JSON.parse(n));
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  static async markAsRead(userId, notificationId) {
    try {
      const key = `notifications:${userId}`;
      const notifications = await redisClient.lRange(key, 0, -1);
      
      const updated = notifications.map(n => {
        const notification = JSON.parse(n);
        if (notification.id === notificationId) {
          notification.read = true;
        }
        return JSON.stringify(notification);
      });

      await redisClient.del(key);
      if (updated.length > 0) {
        await redisClient.rPush(key, updated);
        await redisClient.expire(key, 7 * 24 * 60 * 60);
      }

      return true;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return false;
    }
  }

  static async clearNotifications(userId) {
    try {
      const key = `notifications:${userId}`;
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Clear notifications error:', error);
      return false;
    }
  }

  // Specific notification creators
  static async notifyNewBid(userId, auctionTitle, bidAmount) {
    return this.createNotification(
      userId,
      `New bid of $${bidAmount} placed on "${auctionTitle}"`,
      'info',
      { type: 'bid', bidAmount }
    );
  }

  static async notifyAuctionWon(userId, auctionTitle, winningBid) {
    return this.createNotification(
      userId,
      `Congratulations! You won the auction for "${auctionTitle}" with a bid of $${winningBid}`,
      'success',
      { type: 'auction_won', winningBid }
    );
  }

  static async notifyAuctionLost(userId, auctionTitle) {
    return this.createNotification(
      userId,
      `You were outbid on "${auctionTitle}"`,
      'warning',
      { type: 'auction_lost' }
    );
  }

  static async notifyOrderShipped(userId, orderId, trackingNumber) {
    return this.createNotification(
      userId,
      `Your order #${orderId} has been shipped. Tracking: ${trackingNumber}`,
      'success',
      { type: 'order_shipped', orderId, trackingNumber }
    );
  }

  static async notifyNewOrder(userId, orderId) {
    return this.createNotification(
      userId,
      `You have a new order #${orderId}`,
      'info',
      { type: 'new_order', orderId }
    );
  }
}

module.exports = NotificationService;
