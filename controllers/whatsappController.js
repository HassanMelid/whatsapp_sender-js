let whatsappService;

module.exports = {
    setService(service) {
        whatsappService = service;
    },

    async initialize(req, res) {
        try {
            console.log('Inicializando WhatsApp...');
            await whatsappService.initialize();
            res.json({ status: 'success', message: 'WhatsApp inicializado correctamente. Escanea el código QR en el navegador.' });
        } catch (error) {
            console.error('Error al inicializar WhatsApp:', error.message);
            res.status(500).json({ 
                status: 'error', 
                message: 'Error al inicializar WhatsApp. Por favor, revisa los registros del servidor.',
                details: error.message 
            });
        }
    },

    async restart(req, res) {
        try {
            console.log('Reiniciando WhatsApp...');
            await whatsappService.restartClient();
            res.json({ status: 'success', message: 'WhatsApp reiniciado correctamente. Escanea el código QR nuevamente.' });
        } catch (error) {
            console.error('Error al reiniciar WhatsApp:', error.message);
            res.status(500).json({ 
                status: 'error', 
                message: 'Error al reiniciar WhatsApp. Por favor, revisa los registros del servidor.',
                details: error.message 
            });
        }
    }
};