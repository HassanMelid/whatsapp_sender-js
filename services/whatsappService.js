const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class WhatsAppService extends EventEmitter {
    constructor() {
        super();
        this.authPath = path.join(__dirname, '../.wwebjs_auth'); // Ruta de autenticación
        this.client = this.createClient();
        this.isReady = false; // Estado para verificar si el cliente está listo
        this.initializeEvents();
    }

    createClient() {
        return new Client({
            authStrategy: new LocalAuth({ dataPath: this.authPath }),
            puppeteer: {
                headless: 'new', // Usar 'new' en lugar de false
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--no-first-run',
                    '--disable-gpu',
                    '--window-size=1280,800'
                ]
            }
        });
    }

    initializeEvents() {
        this.client.on('qr', async (qr) => {
            const qrImage = await qrcode.toDataURL(qr);
            this.emit('qr', qrImage);
        });

        this.client.on('ready', () => {
            this.isReady = true; // Marcar el cliente como listo
            this.emit('ready', 'WhatsApp conectado');
        });

        this.client.on('disconnected', (reason) => {
            this.isReady = false; // Marcar el cliente como no listo
            this.emit('disconnected', `WhatsApp desconectado: ${reason}`);
        });

        this.client.on('auth_failure', (msg) => {
            this.isReady = false; // Marcar el cliente como no listo
            this.emit('auth_failure', `Error de autenticación: ${msg}`);
        });

        this.client.on('error', (error) => {
            console.error('Error en el cliente de WhatsApp:', error.message);
            this.emit('error', error.message);
        });
    }

    async initialize() {
        try {
            console.log('Inicializando cliente de WhatsApp...');
            
            // Verificar si ya existe una sesión
            const sessionExists = await this.checkSessionExists();
            if (sessionExists) {
                console.log('Sesión existente encontrada.');
            }

            await this.client.initialize();
            console.log('Cliente de WhatsApp inicializado correctamente.');
        } catch (error) {
            console.error('Error detallado al inicializar:', error);

            // Manejar casos específicos
            if (error.message.includes('QR code terminated')) {
                console.warn('QR code expirado. Reintentar.');
            }

            throw new Error(`Inicialización fallida: ${error.message}`);
        }
    }

    async checkSessionExists() {
        try {
            const sessionFiles = await fs.promises.readdir(this.authPath);
            return sessionFiles.length > 0;
        } catch (error) {
            console.warn('No se pudo verificar la existencia de la sesión:', error.message);
            return false;
        }
    }

    async sendMessage(number, message, media = null) {
        if (!this.isReady) {
            throw new Error('El cliente de WhatsApp no está listo.');
        }

        const formattedNumber = `${number}@c.us`; // Formato requerido por WhatsApp Web
        try {
            if (media) {
                const mediaMessage = new MessageMedia(media.mimetype, media.data, media.filename);
                await this.client.sendMessage(formattedNumber, mediaMessage, { caption: message });
            } else {
                await this.client.sendMessage(formattedNumber, message);
            }

            return { status: 'success', number };
        } catch (error) {
            console.error(`Error al enviar mensaje a ${number}:`, error.message);
            return { status: 'error', number, error: error.message };
        }
    }
}

module.exports = WhatsAppService;
