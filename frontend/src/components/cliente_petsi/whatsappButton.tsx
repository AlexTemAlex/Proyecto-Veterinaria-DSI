import { useState } from 'react';
import './whatsappButton.css';
import whatsappLogo from '../../assets/fonts/feather-icons/icons/whatsapp-logo.svg';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '¡Hola! 👋 Bienvenido a PetSI. ¿En qué podemos ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const [mode, setMode] = useState<'menu' | 'preguntas'>('menu');

  const N8N_WEBHOOK_URL = 'https://tu-n8n-instance.com/webhook/petsi-chat'; // TODO: reemplazar con URL real

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const WHATSAPP_NUMBER = '593995521989';
  const WHATSAPP_MESSAGE = encodeURIComponent('Hola, me gustaría agendar una cita para mi mascota.');
  const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  const handleAgendarCita = () => {
    addUserMessage('Agendar cita');
    setTimeout(() => {
      addBotMessage(`📅 Para agendar tu cita, comunícate con nosotros por WhatsApp:`);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: `__whatsapp_link__`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 300);
    }, 400);
  };

  const handlePreguntas = () => {
    addUserMessage('Tengo una pregunta');
    setMode('preguntas');
    setTimeout(() => {
      addBotMessage('💬 Estoy aquí para ayudarte. Escribe tu pregunta y te responderé.');
    }, 400);
  };

  const sendToN8n = async (text: string) => {
    addUserMessage(text);
    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      addBotMessage(data.reply || data.message || 'Gracias por tu mensaje, te responderemos pronto.');
    } catch {
      addBotMessage('Lo siento, no pude procesar tu mensaje. Intenta de nuevo más tarde.');
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    if (mode === 'menu') setMode('preguntas');
    sendToN8n(inputValue);
    setInputValue('');
  };

  return (
    <>
      {/* Botón flotante con logo WhatsApp */}
      <button 
        className="whatsapp-float" 
        onClick={() => setOpen(!open)}
        title="Abrir chat"
        aria-label="Abrir chat de WhatsApp"
      >
        <img src={whatsappLogo} alt="WhatsApp" className="whatsapp-logo" />
      </button>

      {/* Ventana de chat */}
      {open && (
        <div className="whatsapp-chat-container">
          <div className="chat-header">
            <div className="header-content">
              <h3>PetSI Chat 🐾</h3>
              <p className="status">Estamos en línea</p>
            </div>
            <button 
              className="close-btn" 
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className={`message-bubble ${msg.sender}`}>
                  {msg.text === '__whatsapp_link__' ? (
                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-cta-link"
                    >
                      📲 Abrir chat de WhatsApp
                    </a>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                  <span className="timestamp">{msg.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {mode === 'menu' && (
            <div className="chat-quick-replies">
              <button className="quick-reply-btn quick-reply-cita" onClick={handleAgendarCita}>
                📅 Agendar cita
              </button>
              <button className="quick-reply-btn quick-reply-preguntas" onClick={handlePreguntas}>
                💬 Preguntas
              </button>
            </div>
          )}

          <div className="chat-input-container">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="chat-input"
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              aria-label="Enviar mensaje"
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </>
  );
}
