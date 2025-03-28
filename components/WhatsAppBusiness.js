'use client';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import styles from './WhatsAppBusiness.module.css';

const socket = io('http://localhost:3000'); // Aseguramos que el cliente se conecte al servidor de Socket.IO

const countryFlags = {
  '34': '🇪🇸', // España
  '52': '🇲🇽', // México
  '54': '🇦🇷', // Argentina
  '56': '🇨🇱', // Chile
  '57': '🇨🇴', // Colombia
  '58': '🇻🇪', // Venezuela
  '51': '🇵🇪', // Perú
  '503': '🇸🇻', // El Salvador
  '504': '🇭🇳', // Honduras
  '505': '🇳🇮', // Nicaragua
  '506': '🇨🇷', // Costa Rica
  '507': '🇵🇦', // Panamá
  '591': '🇧🇴', // Bolivia
  '593': '🇪🇨', // Ecuador
  '598': '🇺🇾'  // Uruguay
};

const WhatsAppBusiness = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [countryCode, setCountryCode] = useState('591');
  const [phoneNumbers, setPhoneNumbers] = useState('70123456');
  const [message, setMessage] = useState('Escribe tu mensaje aquí...');
  const [showHistory, setShowHistory] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    socket.on('qr', (qrImage) => {
      setQrCode(qrImage);
    });

    socket.on('ready', () => {
      setIsConnected(true);
      setQrCode(null); // Ocultar QR cuando esté conectado
    });

    socket.on('disconnected', () => {
      setIsConnected(false);
    });

    return () => socket.disconnect();
  }, []);

  const handleInitialize = async () => {
    try {
      console.log('Enviando solicitud para inicializar WhatsApp...');
      const response = await fetch('/api/whatsapp/initialize', { method: 'POST' });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('Error al parsear la respuesta del servidor:', jsonError);
          throw new Error('Error desconocido en el servidor.');
        }
        console.error('Error en la inicialización:', errorData);
        throw new Error(errorData.message || 'Error desconocido');
      }

      const data = await response.json();
      setIsConnected(true);
      console.log('Respuesta de inicialización:', data);
      alert(data.message || 'WhatsApp inicializado correctamente.');
    } catch (error) {
      console.error('Error completo al inicializar WhatsApp:', error);
      alert(`No se pudo inicializar WhatsApp: ${error.message}`);
    }
  };

  const handleSendMessage = () => {
    // Lógica para enviar mensajes
    alert('Mensajes enviados');
  };

  const handleRestart = async () => {
    try {
      console.log('Enviando solicitud para reiniciar WhatsApp...');
      const response = await fetch('/api/whatsapp/restart', { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en el reinicio:', errorData);
        throw new Error(errorData.message || 'Error desconocido');
      }
      const data = await response.json();
      console.log('Respuesta del reinicio:', data);
      alert(data.message || 'WhatsApp reiniciado correctamente.');
    } catch (error) {
      console.error('Error completo al reiniciar WhatsApp:', error);
      alert(`No se pudo reiniciar WhatsApp: ${error.message}`);
    }
  };

  const getFlagEmoji = (code) => {
    return countryFlags[code] || '🏳️'; // Bandera genérica si no coincide
  };

  const handleFocus = (value, setValue, defaultValue) => {
    if (value === defaultValue) {
      setValue('');
    }
  };

  const handleBlur = (value, setValue, defaultValue) => {
    if (value.trim() === '') {
      setValue(defaultValue);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Plataforma WhatsApp Business</h1>
      <p className={styles.subtitle}>Envía mensajes y gestiona tus comunicaciones de WhatsApp</p>

      {!isConnected && (
        <div className={styles.statusBox}>
          <div className={styles.statusContent}>
            <h3 className={styles.statusTitle}>WhatsApp no está inicializado</h3>
            {qrCode && <img src={qrCode} alt="QR Code" className={styles.qrCode} />}
          </div>
          <button 
            className={styles.initButton}
            onClick={handleInitialize}
          >
            Inicializar WhatsApp
          </button>
        </div>
      )}

      {isConnected && (
        <div className={styles.connectedBox}>
          <p className={styles.connectedMessage}>WhatsApp conectado</p>
          <button className={styles.restartButton} onClick={handleRestart}>
            Abrir WhatsApp
          </button>
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
          onFocus={() => handleFocus(phoneNumbers, setPhoneNumbers, '70123456')}
          onBlur={() => handleBlur(phoneNumbers, setPhoneNumbers, '70123456')}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Mensaje</label>
        <textarea
          className={styles.textarea}
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => handleFocus(message, setMessage, 'Escribe tu mensaje aquí...')}
          onBlur={() => handleBlur(message, setMessage, 'Escribe tu mensaje aquí...')}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.toggleButton} ${!showHistory ? styles.activeButton : ''}`}
          onClick={() => setShowHistory(false)}
        >
          Enviar Mensaje
        </button>
        <button
          className={`${styles.toggleButton} ${showHistory ? styles.activeButton : ''}`}
          onClick={() => setShowHistory(true)}
        >
          Historial
        </button>
      </div>
    </div>
  );
};

export default WhatsAppBusiness;
