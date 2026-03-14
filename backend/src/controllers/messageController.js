const Message = require('../models/Message');
const User = require('../models/User');

class MessageController {
  static async getInbox(req, res) {
    try {
      const userId = req.user.userId;
      const conversations = await Message.getInbox(userId, {
        limit: parseInt(req.query.limit, 10) || 50,
        offset: parseInt(req.query.offset, 10) || 0
      });

      res.json({ conversations });
    } catch (error) {
      console.error('Get inbox error:', error);
      res.status(500).json({ error: 'Failed to get inbox' });
    }
  }

  static async sendMessage(req, res) {
    try {
      const { receiverId, productId, content } = req.body;
      const senderId = req.user.userId;

      if (!receiverId || !content) {
        return res.status(400).json({ error: 'Receiver and content are required' });
      }

      if (parseInt(receiverId, 10) === senderId) {
        return res.status(400).json({ error: 'You cannot send messages to yourself' });
      }

      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({ error: 'Receiver not found' });
      }

      const message = await Message.send({
        senderId,
        receiverId,
        productId,
        content
      });

      res.status(201).json({ message });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  static async getThread(req, res) {
    try {
      const userId = req.user.userId;
      const { userId: otherUserId } = req.params;

      const messages = await Message.getThread(userId, otherUserId, {
        limit: parseInt(req.query.limit, 10) || 50,
        offset: parseInt(req.query.offset, 10) || 0
      });

      res.json({ messages });
    } catch (error) {
      console.error('Get thread error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  }
}

module.exports = MessageController;

