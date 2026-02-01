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

  const quickReplies = [
    { text: 'Agendar cita', id: 'booking' },
    { text: 'Servicios', id: 'services' },
    { text: 'Contacto', id: 'contact' }
  ];

  const handleQuickReply = (replyText: string) => {
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: replyText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newUserMessage]);

    // Simular respuesta del bot
    setTimeout(() => {
      let botResponse = '';
      if (replyText.includes('Agendar')) {
        botResponse = '📅 Para agendar tu cita, por favor haz clic en el botón "Agendar cita" en nuestro sitio o contáctanos directamente.';
      } else if (replyText.includes('Servicios')) {
        botResponse = '🏥 Ofrecemos: Consulta General, Vacunación, Cirugía y Peluquería. ¿Te gustaría conocer más detalles de alguno?';
      } else if (replyText.includes('Contacto')) {
        botResponse = '📞 Puedes contactarnos via WhatsApp, llamando o visitándonos en nuestras instalaciones. ¿Prefieres que te proporcione el número?';
      }

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    }, 600);

    setInputValue('');
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      handleQuickReply(inputValue);
    }
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
                  <p>{msg.text}</p>
                  <span className="timestamp">{msg.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-quick-replies">
            {quickReplies.map((reply) => (
              <button
                key={reply.id}
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply.text)}
              >
                {reply.text}
              </button>
            ))}
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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

          <p className="chat-footer">
            Respuesta rápida de nuestro equipo 💬
          </p>
        </div>
      )}
    </>
  );
}
