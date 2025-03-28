const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

router.post('/initialize', whatsappController.initialize);

module.exports = router;