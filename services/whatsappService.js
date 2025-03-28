const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js")
const qrcode = require("qrcode")
const EventEmitter = require("events")
const path = require("path")
const fs = require("fs")

// Import config
let config
try {
  config = require("../config/config")
} catch (error) {
  // Default config if not available
  config = {
    whatsapp: {
      puppeteerOptions: {
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
          "--window-size=800,600",
          "--disable-web-security",
          "--allow-running-insecure-content",
        ],
      },
    },
  }
}

class WhatsAppService extends EventEmitter {
  constructor() {
    super()
    this.authPath = path.join(process.cwd(), ".wwebjs_auth") // Ruta de autenticación
    this.sessionPath = path.join(process.cwd(), "sessions")

    // Configuración mejorada para Puppeteer
    const puppeteerOptions = {
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--window-size=800,600",
        "--disable-web-security",
        "--allow-running-insecure-content",
        "--ignore-certificate-errors",
        "--ignore-certificate-errors-spki-list",
        "--enable-features=NetworkService",
      ],
      ignoreHTTPSErrors: true,
      defaultViewport: null,
    }

    // Si hay una ruta de ejecutable específica, la usamos
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: this.sessionPath,
        clientId: "whatsapp-sender",
      }),
      puppeteer: puppeteerOptions,
      // Usar caché local en lugar de remoto
      webVersionCache: {
        type: "local",
      },
    })

    this.isReady = false // Estado para verificar si el cliente está listo
    this.setupEvents()
  }

  setupEvents() {
    this.client.on("qr", async (qr) => {
      console.log("Código QR generado, enviando a los clientes...")
      try {
        const qrImage = await qrcode.toDataURL(qr)
        this.emit("qr", qrImage)
      } catch (error) {
        console.error("Error al generar imagen QR:", error)
      }
    })

    this.client.on("ready", () => {
      console.log("Cliente de WhatsApp listo y conectado")
      this.isReady = true // Marcar el cliente como listo
      this.emit("ready", "Conectado a WhatsApp")
    })

    this.client.on("authenticated", () => {
      console.log("Cliente de WhatsApp autenticado")
    })

    this.client.on("disconnected", (reason) => {
      console.log("Cliente de WhatsApp desconectado:", reason)
      this.isReady = false // Marcar el cliente como no listo
      this.emit("disconnected", `Desconectado de WhatsApp: ${reason}`)
    })

    this.client.on("auth_failure", (msg) => {
      console.error("Error de autenticación de WhatsApp:", msg)
      this.isReady = false // Marcar el cliente como no listo
      this.emit("error", `Error de autenticación: ${msg}`)
    })

    this.client.on("error", (error) => {
      console.error("Error en el cliente de WhatsApp:", error)
      this.emit("error", `Error en el cliente de WhatsApp: ${error.message}`)
    })
  }

  async initialize() {
    try {
      console.log("Inicializando cliente de WhatsApp...")

      // Bloquear si el cliente ya está listo
      if (this.isReady) {
        console.log("El cliente de WhatsApp ya está inicializado y listo. No se realizará otra inicialización.")
        return
      }

      // Verificar si ya existe una sesión
      const sessionExists = await this.checkSessionExists()
      if (sessionExists) {
        console.log("Sesión existente encontrada.")
      } else {
        console.log("No se encontró ninguna sesión existente.")
        // Limpiar cualquier sesión parcial que pueda causar problemas
        await this.cleanSessions()
      }

      // Inicializar el cliente con manejo de errores mejorado
      try {
        await this.client.initialize()
        console.log("Cliente de WhatsApp inicializado correctamente.")
      } catch (initError) {
        console.error("Error al inicializar el cliente de WhatsApp:", initError)

        // Si hay un error de protocolo, intentamos reiniciar el cliente
        if (initError.message.includes("Protocol error") || initError.message.includes("Target closed")) {
          console.log("Detectado error de protocolo, intentando reiniciar el cliente...")
          await this.restartClient()
        } else {
          throw initError
        }
      }
    } catch (error) {
      console.error("Error detallado al inicializar:", error)
      throw new Error(`Inicialización fallida: ${error.message}`)
    }
  }

  async cleanSessions() {
    try {
      console.log("Limpiando sesiones antiguas...")

      // Verificar si el directorio existe antes de intentar eliminarlo
      if (fs.existsSync(this.sessionPath)) {
        // Leer todos los archivos en el directorio
        const files = await fs.promises.readdir(this.sessionPath)

        // Eliminar cada archivo
        for (const file of files) {
          const filePath = path.join(this.sessionPath, file)
          await fs.promises.unlink(filePath)
        }

        console.log("Sesiones antiguas eliminadas correctamente.")
      } else {
        console.log("No hay directorio de sesiones para limpiar.")
      }
    } catch (error) {
      console.warn("Error al limpiar sesiones antiguas:", error.message)
    }
  }

  async checkSessionExists() {
    try {
      // Verificar si el directorio de sesiones existe
      if (!fs.existsSync(this.sessionPath)) {
        return false
      }

      const sessionFiles = await fs.promises.readdir(this.sessionPath)
      return sessionFiles.length > 0
    } catch (error) {
      console.warn("No se pudo verificar la existencia de la sesión:", error.message)
      return false
    }
  }

  async sendMessage(number, message, media = null) {
    if (!this.isReady) {
      throw new Error("El cliente de WhatsApp no está listo.")
    }

    const formattedNumber = `${number}@c.us` // Formato requerido por WhatsApp Web
    try {
      // Verificar si el número existe en WhatsApp
      const isRegistered = await this.client.isRegisteredUser(formattedNumber)
      if (!isRegistered) {
        return { status: "error", number, error: "El número no está registrado en WhatsApp" }
      }

      if (media) {
        const mediaMessage = new MessageMedia(media.mimetype, media.data, media.filename)
        await this.client.sendMessage(formattedNumber, mediaMessage, { caption: message })
      } else {
        await this.client.sendMessage(formattedNumber, message)
      }

      return { status: "success", number }
    } catch (error) {
      console.error(`Error al enviar mensaje a ${number}:`, error.message)
      return { status: "error", number, error: error.message }
    }
  }

  async restartClient() {
    try {
      console.log("Reiniciando cliente de WhatsApp...")
      this.isReady = false

      // Destruir el cliente actual si está inicializado
      if (this.client) {
        try {
          await this.client.destroy()
          console.log("Cliente de WhatsApp destruido.")
        } catch (destroyError) {
          console.warn("Error al destruir el cliente de WhatsApp:", destroyError.message)
        }
      }

      // Configuración mejorada para Puppeteer
      const puppeteerOptions = {
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--window-size=800,600",
          "--disable-web-security",
          "--allow-running-insecure-content",
          "--ignore-certificate-errors",
          "--ignore-certificate-errors-spki-list",
          "--enable-features=NetworkService",
        ],
        ignoreHTTPSErrors: true,
        defaultViewport: null,
      }

      // Si hay una ruta de ejecutable específica, la usamos
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
      }

      // Crear un nuevo cliente
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: this.sessionPath,
          clientId: "whatsapp-sender-" + Date.now(), // Usar un ID único para evitar conflictos
        }),
        puppeteer: puppeteerOptions,
        // Usar caché local en lugar de remoto
        webVersionCache: {
          type: "local",
        },
      })

      // Configurar eventos nuevamente
      this.setupEvents()

      // Inicializar el nuevo cliente
      await this.client.initialize()
      console.log("Cliente de WhatsApp reiniciado correctamente.")
    } catch (error) {
      console.error("Error al reiniciar el cliente de WhatsApp:", error.message)
      throw new Error(`Error al reiniciar el cliente de WhatsApp: ${error.message}`)
    }
  }

  async logout() {
    try {
      console.log("Cerrando sesión de WhatsApp...")
      if (this.client) {
        await this.client.logout()
        console.log("Sesión de WhatsApp cerrada correctamente.")
      }
    } catch (error) {
      console.error("Error al cerrar sesión de WhatsApp:", error.message)
    }
  }

  async checkClientStatus() {
    try {
      if (!this.isReady) {
        console.log("El cliente de WhatsApp no está listo. Intentando reiniciar...")
        await this.restartClient()
      } else {
        console.log("El cliente de WhatsApp está activo.")
      }
    } catch (error) {
      console.error("Error al verificar el estado del cliente de WhatsApp:", error.message)
    }
  }
}

// Export as both CommonJS and ES modules for compatibility
module.exports = WhatsAppService
module.exports.WhatsAppService = WhatsAppService

