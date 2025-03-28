const express = require("express")
const router = express.Router()
const messageController = require("../controllers/messageController")

// Ruta para enviar mensajes
router.post("/send", messageController.sendMessage)

module.exports = router

