const express = require("express")
const router = express.Router()
const whatsappController = require("../controllers/whatsappController")

module.exports = (io) => {
  const WhatsAppService = require("../services/whatsappService")
  const whatsappService = new WhatsAppService()

  // Eventos de WhatsApp
  whatsappService.on("qr", (qrImage) => {
    io.emit("qr", qrImage)
  })

  whatsappService.on("ready", (message) => {
    io.emit("ready", message)
  })

  whatsappService.on("disconnected", (message) => {
    io.emit("disconnected", message)
  })

  whatsappService.on("auth_failure", (message) => {
    io.emit("auth_failure", message)
  })

  whatsappService.on("error", (error) => {
    io.emit("error", error)
  })

  // Ruta para inicializar WhatsApp
  router.post("/initialize", whatsappController.initialize)

  // Ruta para reiniciar WhatsApp
  router.post("/restart", whatsappController.restart)

  // Ruta para cerrar sesión de WhatsApp
  router.post("/logout", whatsappController.logout)

  // Ruta para verificar el estado del cliente de WhatsApp
  router.get("/status", whatsappController.checkStatus)

  return router
}

