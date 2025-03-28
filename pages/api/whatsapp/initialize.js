export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const WhatsAppService = require('../../../services/whatsappService');
      const whatsappService = new WhatsAppService();

      console.log('Inicializando WhatsApp...');
      await whatsappService.initialize();
      res.json({ status: 'success', message: 'WhatsApp inicializado correctamente. Escanea el código QR en el navegador.' });
    } catch (error) {
      console.error('Error al inicializar WhatsApp:', error.message);
      res.status(500).json({ status: 'error', message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}