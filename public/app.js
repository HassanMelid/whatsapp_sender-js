// public/app.js
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const initBtn = document.getElementById('init-btn');
    const qrContainer = document.getElementById('qr-container');
    const connectionStatus = document.getElementById('connection-status');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const countryCodeInput = document.getElementById('country-code');
    const numbersTextarea = document.getElementById('numbers');
    const messageTextarea = document.getElementById('message');
    const countryFlagContainer = document.getElementById('country-flag');
    const statusBox = document.getElementById('status-box');

    const socket = io();

    // Mapa de códigos de país a emojis de banderas
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

    // Actualizar el emoji de la bandera según el código de país ingresado
    function updateCountryFlag() {
        const countryCode = countryCodeInput.value.trim();
        countryFlagContainer.textContent = countryFlags[countryCode] || '🏳️'; // Bandera genérica si no coincide
    }

    countryCodeInput.addEventListener('input', updateCountryFlag);

    // Inicializar bandera al cargar la página
    updateCountryFlag();

    // Resetear campos solo si contienen el texto o número predeterminado
    numbersTextarea.addEventListener('focus', () => {
        if (numbersTextarea.value === '70123456') {
            numbersTextarea.value = '';
            }
        });
    });

    messageTextarea.addEventListener('focus', () => {
        if (messageTextarea.value === 'Escribe tu mensaje aquí...') {
            messageTextarea.value = '';
        }
    });

    initBtn.addEventListener('click', () => {
        fetch('/api/whatsapp/initialize', { method: 'POST' })
            .then(async (response) => {
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error en la inicialización:', errorData);
                    throw new Error(errorData.message || 'Error desconocido');
                }
                const data = await response.json();
                console.log('Respuesta de inicialización:', data);
                connectionStatus.textContent = "Inicializando...";
                connectionStatus.style.color = "#ff9800";
            })
            .catch((error) => {
                console.error("Error al inicializar:", error);
                alert("No se pudo inicializar WhatsApp. Verifica la conexión o configuración.");
            });
    });
    
    sendMessageBtn.addEventListener('click', async () => {
        const countryCode = countryCodeInput.value.trim();
        const numbers = numbersTextarea.value.split('\n').map(n => n.trim()).filter(n => n);
        const message = messageTextarea.value.trim();
    
        if (!numbers.length || !message) {
            alert("Debes ingresar números y un mensaje.");
            return;
        }
    
        sendMessageBtn.disabled = true;
        sendMessageBtn.textContent = "Enviando...";
    
        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ numbers: numbers.map(n => `${countryCode}${n}`), message })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error al enviar mensajes:', errorData);
                throw new Error(errorData.message || 'Error desconocido');
            }
    
            const result = await response.json();
            console.log('Resultado del envío:', result);
    
            if (result.status === 'completed') {
                alert("Mensajes enviados correctamente.");
            } else {
                alert("Ocurrieron errores al enviar algunos mensajes.");
            }
        } catch (error) {
            console.error("Error al enviar mensajes:", error);
            alert("Error al enviar mensajes.");
        } finally {
            sendMessageBtn.disabled = false;
            sendMessageBtn.textContent = "Enviar Mensaje";
        }
    });

