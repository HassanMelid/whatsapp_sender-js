const express = require('express');
const router = express.Router();
const WhatsAppService = require('../services/whatsappService');

const whatsappService = new WhatsAppService();

router.post('/send', async (req, res) => {
    const { numbers, message } = req.body;

    if (!numbers || !message) {
        return res.status(400).json({ status: 'error', message: 'Números y mensaje son requeridos' });
    }

    if (!whatsappService.isReady) {
        console.warn('El cliente de WhatsApp no está listo. Intentando reiniciar...');
        await whatsappService.restartClient();
        if (!whatsappService.isReady) {
            return res.status(500).json({ status: 'error', message: 'El cliente de WhatsApp no está listo después de intentar reiniciar.' });
        }
    }

    const results = [];
    for (const number of numbers) {
        try {
            const result = await whatsappService.sendMessage(number, message);
            results.push(result);
        } catch (error) {
            console.error(`Error al enviar mensaje a ${number}:`, error.message);
            results.push({ status: 'error', number, error: error.message });
        }
    }

    const hasErrors = results.some(result => result.status === 'error');
    if (hasErrors) {
        return res.status(207).json({ status: 'partial', results }); // Código 207 para respuestas parciales
    }

    res.json({ status: 'completed', results });
});

module.exports = router;
