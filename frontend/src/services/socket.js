import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinAuction(auctionId) {
    if (this.socket) {
      this.socket.emit('join_auction', auctionId);
    }
  }

  leaveAuction(auctionId) {
    if (this.socket) {
      this.socket.emit('leave_auction', auctionId);
    }
  }

  onNewBid(callback) {
    if (this.socket) {
      this.socket.on('new_bid', callback);
    }
  }

  onAuctionEnded(callback) {
    if (this.socket) {
      this.socket.on('auction_ended', callback);
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  removeListener(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();
