let whatsappService

module.exports = {
  setService(service) {
    whatsappService = service
  },

  async initialize(req, res) {
    try {
      console.log("Inicializando WhatsApp...")
      if (whatsappService.isReady) {
        return res.json({
          status: "success",
          message: "El cliente de WhatsApp ya está inicializado y listo.",
        })
      }
      await whatsappService.initialize()
      res.json({
        status: "success",
        message: "WhatsApp inicializado correctamente. Escanea el código QR en el navegador si es necesario.",
      })
    } catch (error) {
      console.error("Error al inicializar WhatsApp:", error.message)
      res.status(500).json({
        status: "error",
        message: "Error al inicializar WhatsApp. Por favor, revisa los registros del servidor.",
        details: error.message,
      })
    }
  },

  async restart(req, res) {
    try {
      console.log("Reiniciando WhatsApp...")
      await whatsappService.restartClient()
      res.json({ status: "success", message: "WhatsApp reiniciado correctamente. Escanea el código QR nuevamente." })
    } catch (error) {
      console.error("Error al reiniciar WhatsApp:", error.message)
      res.status(500).json({
        status: "error",
        message: "Error al reiniciar WhatsApp. Por favor, revisa los registros del servidor.",
        details: error.message,
      })
    }
  },

  async logout(req, res) {
    try {
      console.log("Cerrando sesión de WhatsApp...")
      await whatsappService.logout()
      res.json({ status: "success", message: "Sesión de WhatsApp cerrada correctamente." })
    } catch (error) {
      console.error("Error al cerrar sesión de WhatsApp:", error.message)
      res.status(500).json({
        status: "error",
        message: "Error al cerrar sesión de WhatsApp. Por favor, revisa los registros del servidor.",
        details: error.message,
      })
    }
  },

  async checkStatus(req, res) {
    try {
      console.log("Verificando el estado del cliente de WhatsApp...")
      await whatsappService.checkClientStatus()
      res.json({ status: "success", message: "Estado del cliente verificado." })
    } catch (error) {
      console.error("Error al verificar el estado del cliente de WhatsApp:", error.message)
      res.status(500).json({
        status: "error",
        message: "Error al verificar el estado del cliente de WhatsApp.",
        details: error.message,
      })
    }
  },
}

