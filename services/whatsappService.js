const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const EventEmitter = require('events');
const config = require('../config');
const fs = require('fs');
const path = require('path');

class WhatsAppService extends EventEmitter {
    constructor() {
        super();
        this.authPath = path.join(__dirname, '../.wwebjs_auth'); // Ruta de autenticación
        this.client = new Client({
            authStrategy: new LocalAuth({ dataPath: './sessions' }),
            puppeteer: config.whatsapp.puppeteerOptions // Usar configuración centralizada
        });
        this.isReady = false; // Estado para verificar si el cliente está listo
        this.setupEvents();
    }

    setupEvents() {
        this.client.on('qr', async (qr) => {
            this.emit('qr', await qrcode.toDataURL(qr));
        });

        this.client.on('ready', () => {
            this.isReady = true; // Marcar el cliente como listo
            this.emit('ready', 'Conectado a WhatsApp');
        });

        this.client.on('disconnected', (reason) => {
            this.isReady = false; // Marcar el cliente como no listo
            this.emit('disconnected', `Desconectado de WhatsApp: ${reason}`);
        });

        this.client.on('auth_failure', (msg) => {
            this.isReady = false; // Marcar el cliente como no listo
            this.emit('error', `Error de autenticación: ${msg}`);
        });

        this.client.on('error', (error) => {
            this.emit('error', `Error en el cliente de WhatsApp: ${error.message}`);
        });
    }

    async initialize() {
        try {
            console.log('Inicializando cliente de WhatsApp...');
            
            // Verificar si ya existe una sesión
            const sessionExists = await this.checkSessionExists();
            if (sessionExists) {
                console.log('Sesión existente encontrada.');
            } else {
                console.log('No se encontró ninguna sesión existente.');
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

    async restartClient() {
        try {
            console.log('Reiniciando cliente de WhatsApp...');
            this.isReady = false;

            // Destruir el cliente actual si está inicializado
            if (this.client) {
                await this.client.destroy();
                console.log('Cliente de WhatsApp destruido.');
            }

            // Crear un nuevo cliente
            this.client = new Client({
                authStrategy: new LocalAuth({ dataPath: './sessions' }),
                puppeteer: config.whatsapp.puppeteerOptions
            });

            // Configurar eventos nuevamente
            this.setupEvents();

            // Inicializar el nuevo cliente
            await this.client.initialize();
            console.log('Cliente de WhatsApp reiniciado correctamente.');
        } catch (error) {
            console.error('Error al reiniciar el cliente de WhatsApp:', error.message);
            throw new Error(`Error al reiniciar el cliente de WhatsApp: ${error.message}`);
        }
    }
}

module.exports = WhatsAppService;