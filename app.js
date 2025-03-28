require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const next = require('next');
const config = require('./config');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

nextApp.prepare().then(() => {
    // Configuración
    app.set('port', config.app.port);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Socket.io
    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado');
        
        socket.on('disconnect', () => {
            console.log('Cliente desconectado');
        });
    });

    // Rutas API
    app.use('/api', require('./routes/whatsapp')(io)); // Registrar correctamente las rutas de WhatsApp
    app.use('/api/messages', require('./routes/messageRoutes')); // Registrar las rutas de mensajes

    // Manejar rutas no encontradas en la API
    app.use('/api/*', (req, res) => {
        res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
    });

    // Manejar todas las demás rutas con Next.js
    app.all('*', (req, res) => {
        return handle(req, res);
    });

    // Iniciar servidor
    server.listen(app.get('port'), () => {
        console.log(`Servidor en puerto ${app.get('port')}`);
    });

    // Manejo de errores
    process.on('unhandledRejection', (err) => {
        console.error('Error no manejado:', err);
    });

    process.on('uncaughtException', (err) => {
        console.error('Excepción no capturada:', err);
        process.exit(1); // Salir del proceso para evitar estados inconsistentes
    });
});
