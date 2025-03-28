require('dotenv').config();

module.exports = {
    app: {
        port: process.env.PORT || 3000,
        maxMessagesPerMinute: 30,
        defaultMessageDelay: 2000
    },
    whatsapp: {
        countryCode: process.env.COUNTRY_CODE || '591',
        puppeteerOptions: {
            headless: false, // Cambiar a true si no necesitas ver el navegador
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || require('puppeteer').executablePath(),
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--window-size=1280,800',
                '--user-data-dir=./puppeteer_data' // Usar un directorio de datos para mantener la sesión
            ]
        }
    },
    database: {
        path: process.env.DB_PATH || './database/messages.db',
        backupInterval: 3600000
    },
    security: {
        allowedPhonePrefixes: ['591', '54', '55', '56', '57', '58', '51', '52'],
        enableRateLimiting: true,
        maxRequestsPerMinute: 100
    }
};
