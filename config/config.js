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
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--window-size=800,600'
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