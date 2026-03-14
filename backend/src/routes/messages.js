const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/auth');

router.get('/inbox', authMiddleware, MessageController.getInbox);
router.post('/', authMiddleware, MessageController.sendMessage);
router.get('/thread/:userId', authMiddleware, MessageController.getThread);

module.exports = router;

