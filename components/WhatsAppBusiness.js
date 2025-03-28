'use client';
import { useState } from 'react';
import styles from './WhatsAppBusiness.module.css';

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

  const handleInitialize = async () => {
    try {
      console.log('Enviando solicitud para inicializar WhatsApp...');
      const response = await fetch('/api/initialize', { method: 'POST' });
      
      if (response.ok) {
        const data = await response.json();
        setIsConnected(true);
        console.log('Respuesta de inicialización:', data);
        alert(data.message || 'WhatsApp inicializado correctamente.');
      } else {
        const errorData = await response.json();
        console.error('Error en la inicialización:', errorData);
        throw new Error(errorData.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error completo al inicializar WhatsApp:', error);
      alert(`No se pudo inicializar WhatsApp: ${error.message}`);
    }
  };

  const handleSendMessage = () => {
    // Lógica para enviar mensajes
    alert('Mensajes enviados');
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

      <div className={styles.statusBox}>
        <h3 className={styles.statusTitle}>WhatsApp no está inicializado</h3>
        <p className={styles.connectionStatus}>
          {isConnected ? 'Conectado' : 'No conectado'}
        </p>
        
        {!isConnected && (
          <button 
            className={styles.initButton}
            onClick={handleInitialize}
          >
            Inicializar WhatsApp
          </button>
        )}
      </div>

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
