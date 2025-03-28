const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'messages.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Crear tabla de mensajes si no existe
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone_number TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT CHECK(status IN ('success', 'error')) NOT NULL,
            error_message TEXT,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;
