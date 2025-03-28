const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/api/messages/send', messageController.sendMessage);

module.exports = router;