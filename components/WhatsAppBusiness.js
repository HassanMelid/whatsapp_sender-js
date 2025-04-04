"use client"

import { useState, useEffect } from "react"
import io from "socket.io-client"
import styles from "./WhatsAppBusiness.module.css"

// We'll initialize socket on the client side only
let socket

const countryFlags = {
  34: "🇪🇸", // España
  52: "🇲🇽", // México
  54: "🇦🇷", // Argentina
  56: "🇨🇱", // Chile
  57: "🇨🇴", // Colombia
  58: "🇻🇪", // Venezuela
  51: "🇵🇪", // Perú
  503: "🇸🇻", // El Salvador
  504: "🇭🇳", // Honduras
  505: "🇳🇮", // Nicaragua
  506: "🇨🇷", // Costa Rica
  507: "🇵🇦", // Panamá
  591: "🇧🇴", // Bolivia
  593: "🇪🇨", // Ecuador
  598: "🇺🇾", // Uruguay
}

const WhatsAppBusiness = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [countryCode, setCountryCode] = useState("591")
  const [phoneNumbers, setPhoneNumbers] = useState("70123456")
  const [message, setMessage] = useState("Escribe tu mensaje aquí...")
  const [showHistory, setShowHistory] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [sentMessagesCount, setSentMessagesCount] = useState(0)
  const [failedMessagesCount, setFailedMessagesCount] = useState(0)
  const [error, setError] = useState(null)
  const [isInitializing, setIsInitializing] = useState(false)

  // Initialize socket connection on client side
  useEffect(() => {
    // socketInitializer will handle socket setup
    const socketInitializer = async () => {
      // We need to check if we're in the browser
      if (typeof window !== "undefined") {
        socket = io({
          path: "/socket.io",
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          autoConnect: true,
          transports: ["polling", "websocket"],
        })

        socket.on("connect", () => {
          console.log("Socket connected")
        })

        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err)
          setError(`Error de conexión: ${err.message}`)
        })

        socket.on("qr", (qrImage) => {
          setQrCode(qrImage)
          setError(null)
        })

        socket.on("ready", () => {
          setIsConnected(true)
          setQrCode(null) // Ocultar QR cuando esté conectado
          setError(null)
          setIsInitializing(false)
        })

        socket.on("disconnected", () => {
          setIsConnected(false)
          setError("WhatsApp se ha desconectado")
          setIsInitializing(false)
        })

        socket.on("error", (errorMsg) => {
          setError(errorMsg)
          setIsInitializing(false)
        })
      }
    }

    socketInitializer()

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  const handleInitialize = async () => {
    try {
      setIsInitializing(true)
      setError(null)
      console.log("Enviando solicitud para inicializar WhatsApp...")
      const response = await fetch("/api/whatsapp/initialize", { method: "POST" })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (jsonError) {
          console.error("Error al parsear la respuesta del servidor:", jsonError)
          setError("Error desconocido en el servidor")
          setIsInitializing(false)
          return
        }
        console.error("Error en la inicialización:", errorData)
        setError(errorData.message || "Error desconocido")
        setIsInitializing(false)
        return
      }

      const data = await response.json()
      console.log("Respuesta de inicialización:", data)
      // No establecemos isInitializing a false aquí, esperamos el evento "ready" o "error" de Socket.IO
    } catch (error) {
      console.error("Error completo al inicializar WhatsApp:", error)
      setError(error.message || "Error al inicializar WhatsApp")
      setIsInitializing(false)
    }
  }

  const handleSendMessage = async () => {
    const numbers = phoneNumbers
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n)
    if (!numbers.length || !message.trim()) {
      setError("Debes ingresar números y un mensaje.")
      return
    }

    try {
      setError(null)
      console.log("Enviando mensajes...")
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers: numbers.map((n) => `${countryCode}${n}`), message }),
      })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (jsonError) {
          console.error("Error al parsear la respuesta del servidor:", jsonError)
          setError("Error desconocido en el servidor")
          return
        }
        console.error("Error al enviar mensajes:", errorData)
        setError(errorData.message || "Error al enviar mensajes")
        return
      }

      const result = await response.json()
      const sentCount = result.results.filter((r) => r.status === "success").length
      const failedCount = result.results.filter((r) => r.status === "error").length

      setSentMessagesCount(sentCount)
      setFailedMessagesCount(failedCount)

      console.log(`Mensajes enviados: ${sentCount}`)
      console.log(`Mensajes no enviados: ${failedCount}`)

      if (failedCount > 0) {
        const failedNumbers = result.results
          .filter((r) => r.status === "error")
          .map((r) => r.number.split("@")[0])
          .join(", ")
        setError(`No se pudieron enviar mensajes a: ${failedNumbers}`)
      }
    } catch (error) {
      console.error("Error al enviar mensajes:", error)
      setError(error.message || "Error al enviar mensajes")
    }
  }

  const getFlagEmoji = (code) => {
    return countryFlags[code] || "🏳️" // Bandera genérica si no coincide
  }

  const handleFocus = (value, setValue, defaultValue) => {
    if (value === defaultValue) {
      setValue("")
    }
  }

  const handleBlur = (value, setValue, defaultValue) => {
    if (value.trim() === "") {
      setValue(defaultValue)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>
          Desarrollado por{" "}
          <a href="https://www.melidsoft.com" target="_blank" rel="noopener noreferrer" className={styles.link}>
            Melid Soft
          </a>
        </h1>
      </header>
      <h2 className={styles.title}>Plataforma WhatsApp Business</h2>
      <p className={styles.subtitle}>Envía mensajes y gestiona tus comunicaciones de WhatsApp</p>

      {error && (
        <div className={styles.errorBox}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      )}

      {!isConnected && (
        <div className={styles.statusBox}>
          <div className={styles.statusContent}>
            <h3 className={styles.statusTitle}>WhatsApp no está inicializado</h3>
            {qrCode && <img src={qrCode || "/placeholder.svg"} alt="QR Code" className={styles.qrCode} />}
          </div>
          <button
            className={styles.initButton}
            onClick={handleInitialize}
            disabled={isConnected || isInitializing} // Deshabilitar si ya está conectado o inicializando
          >
            {isInitializing ? "Inicializando..." : "Inicializar WhatsApp"}
          </button>
        </div>
      )}

      {isConnected && (
        <div className={styles.connectedBox}>
          <p className={styles.connectedMessage}>WhatsApp conectado</p>
        </div>
      )}

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Código de país</label>
        <div className={styles.flagInputContainer}>
          <span className={styles.flagEmoji}>{getFlagEmoji(countryCode)}</span>
          <input
            type="text"
            className={styles.inputField}
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Números de teléfono (uno por línea)</label>
        <textarea
          className={styles.textarea}
          rows={4}
          value={phoneNumbers}
          onChange={(e) => setPhoneNumbers(e.target.value)}
          onFocus={() => handleFocus(phoneNumbers, setPhoneNumbers, "70123456")}
          onBlur={() => handleBlur(phoneNumbers, setPhoneNumbers, "70123456")}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>
          Mensaje
          <span className={styles.messageStats}>
            (Enviados: {sentMessagesCount}, No enviados: {failedMessagesCount})
          </span>
        </label>
        <textarea
          className={styles.textarea}
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => handleFocus(message, setMessage, "Escribe tu mensaje aquí...")}
          onBlur={() => handleBlur(message, setMessage, "Escribe tu mensaje aquí...")}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.toggleButton} ${!showHistory ? styles.activeButton : ""}`}
          onClick={handleSendMessage}
          disabled={!isConnected}
        >
          Enviar Mensaje
        </button>
        <button
          className={`${styles.toggleButton} ${showHistory ? styles.activeButton : ""}`}
          onClick={() => setShowHistory(true)}
        >
          Historial
        </button>
      </div>
    </div>
  )
}

export default WhatsAppBusiness

// Compare this snippet from pages/index.js:
// import WhatsAppBusiness from "../components/WhatsAppBusiness"