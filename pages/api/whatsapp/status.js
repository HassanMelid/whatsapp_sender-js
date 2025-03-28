// Importamos el servicio de WhatsApp
const WhatsAppService = require("../../../services/whatsappService")

// Usamos la misma instancia del servicio de WhatsApp
let whatsappService

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ status: "error", message: "Method not allowed" })
  }

  try {
    // Creamos el servicio si no existe
    if (!whatsappService) {
      whatsappService = new WhatsAppService()
    }

    const isReady = whatsappService.isReady || false

    res.status(200).json({
      status: "success",
      isReady,
      message: isReady ? "WhatsApp está conectado" : "WhatsApp no está conectado",
    })
  } catch (error) {
    console.error("Error al verificar el estado de WhatsApp:", error.message)
    res.status(500).json({
      status: "error",
      message: error.message || "Error desconocido al verificar el estado",
    })
  }
}

