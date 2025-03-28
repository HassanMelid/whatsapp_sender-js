const express = require("express")
const http = require("http")
const next = require("next")
const socketIO = require("socket.io")
const { parse } = require("url")
const config = require("./config/config")
const path = require("path")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

// Función para manejar errores
const handleError = (err) => {
  console.error("Error en el servidor:", err)
  if (err.code === "EADDRINUSE") {
    console.error(`El puerto ${process.env.PORT || 3000} ya está en uso. Intenta con otro puerto.`)
    process.exit(1)
  }
}

app
  .prepare()
  .then(() => {
    const server = express()
    const httpServer = http.createServer(server)

    // Servir archivos estáticos
    server.use(express.static(path.join(__dirname, "public")))

    // Configurar middleware para parsear JSON y formularios
    server.use(express.json())
    server.use(express.urlencoded({ extended: true }))

    // Set up Socket.IO
    const io = socketIO(httpServer, {
      cors: {
        origin: "*", // Permitir conexiones desde cualquier origen
        methods: ["GET", "POST"],
        credentials: true,
      },
      path: "/socket.io",
    })

    // Make io available globally for API routes
    global.io = io

    // Socket.IO connection handling
    io.on("connection", (socket) => {
      console.log("Cliente conectado a Socket.IO")

      socket.on("disconnect", () => {
        console.log("Cliente desconectado de Socket.IO")
      })
    })

    // Handle all requests with Next.js
    server.all("*", (req, res) => {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Verificar si la ruta es válida
      if (!pathname.startsWith("/_next") && !pathname.startsWith("/api") && !pathname.startsWith("/static")) {
        console.error(`Ruta no encontrada: ${pathname}`);
      }

      return handle(req, res, parsedUrl); // Next.js maneja las rutas restantes
    })

    // Start the server
    const PORT = process.env.PORT || 3000
    httpServer.listen(PORT, "0.0.0.0", (err) => {
      if (err) {
        handleError(err)
        return
      }
      console.log(`> Servidor listo en http://localhost:${PORT}`)
      console.log(`> Para acceder desde otras computadoras, usa la IP de este servidor y el puerto ${PORT}`)
    })

    // Manejar errores no capturados
    httpServer.on("error", handleError)

    // Manejar señales de terminación
    process.on("SIGTERM", () => {
      console.log("Recibida señal SIGTERM, cerrando servidor...")
      httpServer.close(() => {
        console.log("Servidor cerrado")
        process.exit(0)
      })
    })
  })
  .catch((err) => {
    console.error("Error al preparar Next.js:", err)
    process.exit(1)
  })

