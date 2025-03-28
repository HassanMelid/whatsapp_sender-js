// Importamos el servicio de WhatsApp
const WhatsAppService = require("../../../services/whatsappService")

// Usamos la misma instancia del servicio de WhatsApp
let whatsappService

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" })
  }

  try {
    const { numbers, message } = req.body

    if (!numbers || !message) {
      return res.status(400).json({
        status: "error",
        message: "Números y mensaje son requeridos.",
      })
    }

    // Creamos el servicio si no existe
    if (!whatsappService) {
      whatsappService = new WhatsAppService()
    }

    const results = []
    for (const number of numbers) {
      try {
        const formattedNumber = `${number}@c.us` // Formatear número para WhatsApp Web
        const result = await whatsappService.sendMessage(formattedNumber, message)
        results.push(result)
      } catch (error) {
        console.error(`Error al enviar mensaje a ${number}:`, error.message)
        results.push({ status: "error", number, error: error.message })
      }
    }

    const hasErrors = results.some((result) => result.status === "error")
    if (hasErrors) {
      return res.status(207).json({ status: "partial", results })
    }

    res.status(200).json({ status: "completed", results })
  } catch (error) {
    console.error("Error al enviar mensajes:", error.message)
    res.status(500).json({
      status: "error",
      message: error.message || "Error desconocido al enviar mensajes",
    })
  }
}

// Compare this snippet from services/whatsappService.js: