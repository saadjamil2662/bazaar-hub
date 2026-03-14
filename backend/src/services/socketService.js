const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.warn('Socket connection attempt without token');
        return next(new Error('Authentication required: No token provided'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
        next();
      } catch (error) {
        console.warn('Socket authentication error:', error.message);
        if (error.name === 'TokenExpiredError') {
          return next(new Error('Authentication error: Token expired'));
        }
        return next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} (${socket.userEmail}) connected via socket (${socket.id})`);

      // Join auction room
      socket.on('join_auction', (auctionId) => {
        if (!auctionId) {
          console.warn(`Invalid auction ID from user ${socket.userId}`);
          return;
        }
        socket.join(`auction_${auctionId}`);
        console.log(`User ${socket.userId} joined auction ${auctionId}`);
      });

      // Leave auction room
      socket.on('leave_auction', (auctionId) => {
        if (!auctionId) {
          console.warn(`Invalid auction ID from user ${socket.userId}`);
          return;
        }
        socket.leave(`auction_${auctionId}`);
        console.log(`User ${socket.userId} left auction ${auctionId}`);
      });

      // Handle socket errors
      socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.userId}:`, error);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`User ${socket.userId} disconnected: ${reason}`);
      });
    });
  }

  getIO() {
    return this.io;
  }

  // Broadcast new bid to auction room
  broadcastBid(auctionId, bidData) {
    this.io.to(`auction_${auctionId}`).emit('new_bid', bidData);
  }

  // Broadcast auction end
  broadcastAuctionEnd(auctionId, data) {
    this.io.to(`auction_${auctionId}`).emit('auction_ended', data);
  }

  // Send notification to specific user
  sendNotification(userId, notification) {
    this.io.to(userId).emit('notification', notification);
  }
}

module.exports = SocketService;
