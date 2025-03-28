// Importamos el servicio de WhatsApp
const WhatsAppService = require("../../../services/whatsappService")

// Inicializamos el servicio de WhatsApp
let whatsappService

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" })
  }

  try {
    // Creamos el servicio si no existe
    if (!whatsappService) {
      whatsappService = new WhatsAppService()

      // Configuramos los manejadores de eventos para socket.io
      whatsappService.on("qr", (qrImage) => {
        if (global.io) {
          console.log("Emitiendo código QR a los clientes conectados")
          global.io.emit("qr", qrImage)
        } else {
          console.warn("Socket.IO no está disponible para emitir el código QR")
        }
      })

      whatsappService.on("ready", (message) => {
        if (global.io) {
          global.io.emit("ready", message)
        }
      })

      whatsappService.on("disconnected", (message) => {
        if (global.io) {
          global.io.emit("disconnected", message)
        }
      })

      whatsappService.on("error", (errorMsg) => {
        if (global.io) {
          global.io.emit("error", errorMsg)
        }
      })
    }

    console.log("Inicializando WhatsApp...")

    try {
      await whatsappService.initialize()

      res.status(200).json({
        status: "success",
        message: "WhatsApp inicializado correctamente. Escanea el código QR en el navegador.",
      })
    } catch (error) {
      console.error("Error al inicializar WhatsApp:", error)

      // Intentar reiniciar el cliente si hay un error de inicialización
      if (error.message.includes("Protocol error") || error.message.includes("Target closed")) {
        try {
          console.log("Intentando reiniciar el cliente de WhatsApp...")
          await whatsappService.restartClient()

          res.status(200).json({
            status: "success",
            message: "WhatsApp reiniciado correctamente. Escanea el código QR en el navegador.",
          })
        } catch (restartError) {
          console.error("Error al reiniciar el cliente de WhatsApp:", restartError)
          res.status(500).json({
            status: "error",
            message: "Error al reiniciar el cliente de WhatsApp: " + restartError.message,
          })
        }
      } else {
        res.status(500).json({
          status: "error",
          message: error.message || "Error desconocido al inicializar WhatsApp",
        })
      }
    }
  } catch (error) {
    console.error("Error general en el handler:", error)
    res.status(500).json({
      status: "error",
      message: error.message || "Error desconocido en el servidor",
    })
  }
}

