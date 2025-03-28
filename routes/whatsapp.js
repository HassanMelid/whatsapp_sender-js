const express = require('express');
const router = express.Router();
const WhatsAppService = require('../services/whatsappService');

module.exports = (io) => {
    const whatsappService = new WhatsAppService();

    whatsappService.on('qr', (qrImage) => {
        io.emit('qr', qrImage);
    });

    whatsappService.on('ready', (message) => {
        io.emit('ready', message);
    });

    whatsappService.on('disconnected', (message) => {
        io.emit('disconnected', message);
    });

    whatsappService.on('auth_failure', (message) => {
        io.emit('auth_failure', message);
    });

    whatsappService.on('error', (error) => {
        io.emit('error', error);
    });

    // Ruta para inicializar WhatsApp
    router.post('/initialize', async (req, res) => {
        try {
            console.log('Inicializando WhatsApp...');
            await whatsappService.initialize();
            res.json({ status: 'success', message: 'WhatsApp inicializado correctamente. Escanea el código QR en el navegador.' });
        } catch (error) {
            console.error('Error al inicializar WhatsApp:', error.message);
            res.status(500).json({ status: 'error', message: error.message });
        }
    });

    return router;
};
