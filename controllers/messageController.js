const whatsappService = require("../services/whatsappService")

module.exports = {
  async sendMessage(req, res) {
    const { numbers, message } = req.body

    if (!numbers || !message) {
      return res.status(400).json({ status: "error", message: "Números y mensaje son requeridos." })
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

    res.json({ status: "completed", results })
  },
}

