require("dotenv").config()
const express = require("express")
const http = require("http")
const socketIO = require("socket.io")
const next = require("next")
const config = require("./config/config")

const dev = process.env.NODE_ENV !== "production"
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

const app = express()
const server = http.createServer(app)
const io = socketIO(server, {
  cors: {
    origin: "*", // Permitir todas las conexiones en desarrollo
    methods: ["GET", "POST"],
  },
})

nextApp.prepare().then(() => {
  // Configuración
  app.set("port", config.app.port)
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Socket.IO
  io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado")
    socket.on("disconnect", () => {
      console.log("Cliente desconectado")
    })
  })

  // Rutas API
  app.use("/api/whatsapp", require("./routes/whatsappRoutes")(io)) // Registrar rutas de WhatsApp
  app.use("/api/messages", require("./routes/messageRoutes")) // Registrar rutas de mensajes

  // Manejar rutas no encontradas en la API
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      status: "error",
      message: "Ruta de API no encontrada",
      path: req.path,
    })
  })

  // Manejar todas las demás rutas con Next.js
  app.all("*", (req, res) => {
    return handle(req, res) // Next.js maneja las rutas restantes
  })

  // Iniciar servidor
  server.listen(app.get("port"), () => {
    console.log(`Servidor en puerto ${app.get("port")}`)
  })

  // Manejo de errores
  process.on("unhandledRejection", (err) => {
    console.error("Error no manejado:", err)
  })

  process.on("uncaughtException", (err) => {
    console.error("Excepción no capturada:", err)
    process.exit(1)
  })
})

