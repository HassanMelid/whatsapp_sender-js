// Importamos el servicio de WhatsApp
const WhatsAppService = require("../../../services/whatsappService")

// Usamos la misma instancia del servicio de WhatsApp
let whatsappService

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" })
  }

  try {
    // Creamos el servicio si no existe
    if (!whatsappService) {
      whatsappService = new WhatsAppService()
    }

    await whatsappService.logout()

    res.status(200).json({
      status: "success",
      message: "Sesión de WhatsApp cerrada correctamente.",
    })
  } catch (error) {
    console.error("Error al cerrar sesión de WhatsApp:", error.message)
    res.status(500).json({
      status: "error",
      message: error.message || "Error desconocido al cerrar sesión",
    })
  }
}

