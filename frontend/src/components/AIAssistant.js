import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FaMicrophone, FaStop, FaPaperPlane, FaTrash, FaRobot, FaUser, FaLanguage } from 'react-icons/fa';

const AIAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('french');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Envoyer automatiquement quand le micro s'arrête et qu'il y a du texte
  useEffect(() => {
    if (!listening && transcript && !loading && transcript.trim()) {
      const timer = setTimeout(() => {
        sendMessage();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [listening, transcript, loading]);

  const startListening = () => {
    try {
      if (!browserSupportsSpeechRecognition) {
        toast.error(' Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome.');
        return;
      }

      resetTranscript();
      
      let langCode = 'fr-FR';
      if (language === 'english') {
        langCode = 'en-US';
      } else if (language === 'french') {
        langCode = 'fr-FR';
      } else {
        langCode = 'fr-FR';
        toast.info(' Utilisation du français pour la reconnaissance vocale');
      }
      
      SpeechRecognition.startListening({
        continuous: true,
        language: langCode
      });
      toast.info(' Écoute en cours... Parlez maintenant');
      console.log(' Micro activé avec la langue:', langCode);
    } catch (error) {
      console.error(' Erreur micro:', error);
      toast.error(' Erreur d\'accès au micro: ' + error.message);
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    toast.info('⏹️ Écoute arrêtée');
  };

  const sendMessage = async () => {
    // Si le micro est actif, on l'arrête d'abord
    if (listening) {
      SpeechRecognition.stopListening();
    }

    if (!input.trim()) {
      toast.info(' Tapez ou dites un message');
      return;
    }

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('access_token');
      
      console.log(' Token:', token ? token.substring(0, 30) + '...' : 'Pas de token');
      console.log(' Message:', userMessage);
      console.log(' Langue:', language);

      if (!token) {
        toast.error('❌ Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
        setLoading(false);
        setIsTyping(false);
        return;
      }

      const response = await axios.post(
        'http://127.0.0.1:8000/api/ai/chat/',
        {
          message: userMessage,
          context: 'Assistant IA Mas-Pro AI',
          language: language
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log(' Réponse reçue:', response.data);

      const assistantResponse = response.data.response || 'Désolé, je n\'ai pas compris.';
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantResponse 
      }]);

      if (response.data.language) {
        const langMap = {
          'french': '🇫🇷 Français',
          'english': '🇬🇧 English',
          'wolof': '🇸🇳 Wolof'
        };
        toast.success(` Langue: ${langMap[response.data.language]}`);
      }

    } catch (err) {
      console.error(' ERREUR DÉTAILLÉE:', err);
      
      if (err.response) {
        console.error(' Status:', err.response.status);
        console.error(' Data:', err.response.data);
        
        if (err.response.status === 401) {
          toast.error('❌ Session expirée. Reconnectez-vous.');
          navigate('/login');
        } else if (err.response.status === 500) {
          toast.error('❌ Erreur serveur. Vérifiez la configuration IA.');
        } else {
          toast.error(`❌ Erreur ${err.response.status}: ${err.response.data?.error || 'Erreur inconnue'}`);
        }
      } else if (err.request) {
        console.error(' Pas de réponse du serveur');
        toast.error('❌ Serveur indisponible. Vérifiez que Django tourne sur le port 8000.');
      } else {
        toast.error('❌ Erreur: ' + err.message);
      }
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.info(' Conversation effacée');
  };

  const getLanguageFlag = (lang) => {
    const map = {
      'french': '🇫🇷',
      'english': '🇬🇧',
      'wolof': '🇸🇳'
    };
    return map[lang] || '';
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning shadow">
          <h5> Navigateur non supporté</h5>
          <p>La reconnaissance vocale n'est pas supportée par votre navigateur. Utilisez Chrome ou Edge.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3">
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-10 col-md-12">
          {/* En-tête */}
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-gradient-primary text-white p-4 border-0">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-white rounded-circle p-2 shadow-sm">
                    <FaRobot size={28} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold"> Mas-Pro AI</h4>
                    <small className="opacity-75">
                      {getLanguageFlag(language)} Assistant intelligent
                    </small>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-sm btn-outline-light rounded-pill"
                    onClick={clearChat}
                  >
                    <FaTrash className="me-1" /> Effacer
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              {/* Sélecteur de langue */}
              <div className="p-3 bg-light border-bottom">
                <div className="row g-2 align-items-center">
                  <div className="col-auto">
                    <FaLanguage className="text-primary" size={20} />
                  </div>
                  <div className="col">
                    <select 
                      className="form-select form-select-sm border-0 bg-white shadow-sm"
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="french">🇫🇷 Français</option>
                      <option value="english">🇬🇧 English</option>
                      <option value="wolof">🇸🇳 Wolof</option>
                    </select>
                  </div>
                  <div className="col-auto">
                    <span className="badge bg-success">
                      {listening ? ' En direct' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-container" style={{ height: '450px', overflowY: 'auto', padding: '20px', background: '#f8f9fa' }}>
                {messages.length === 0 ? (
                  <div className="text-center text-muted mt-5">
                    <div className="display-1 mb-3"></div>
                    <h5>Commencez une conversation</h5>
                    <p className="small">Posez votre question en français, anglais ou wolof</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-end' : ''}`}>
                      <div className={`d-inline-block p-3 rounded-3 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border'}`} style={{ maxWidth: '80%' }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          {msg.role === 'user' ? <FaUser size={14} /> : <FaRobot size={14} className="text-primary" />}
                          <span className="fw-bold small">
                            {msg.role === 'user' ? 'Vous' : 'Mas-Pro AI'}
                          </span>
                        </div>
                        <div className="text-start" style={{ whiteSpace: 'pre-wrap' }}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="text-start">
                    <div className="d-inline-block bg-white p-3 rounded-3 shadow-sm">
                      <div className="d-flex align-items-center gap-2">
                        <FaRobot className="text-primary" />
                        <span>L'IA réfléchit</span>
                        <span className="typing-dots">...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <div className="p-3 bg-white border-top">
                <div className="d-flex gap-2">
                  <button 
                    className={`btn ${listening ? 'btn-danger' : 'btn-outline-secondary'} rounded-circle`}
                    onClick={listening ? stopListening : startListening}
                    style={{ width: '45px', height: '45px' }}
                  >
                    {listening ? <FaStop size={18} /> : <FaMicrophone size={18} />}
                  </button>
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      language === 'french' ? 'Tapez votre message...' :
                      language === 'english' ? 'Type your message...' :
                      'Tàjj sa xarala...'
                    }
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <button 
                    className={`btn rounded-circle ${input.trim() || listening ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={sendMessage} 
                    disabled={loading}
                    style={{ width: '45px', height: '45px' }}
                  >
                    <FaPaperPlane size={18} />
                  </button>
                </div>
                {listening && (
                  <div className="mt-2 d-flex align-items-center gap-2">
                    <div className="spinner-grow spinner-grow-sm text-danger" role="status" />
                    <span className="text-danger fw-bold small animate-pulse">
                       Écoute active... Parlez maintenant
                    </span>
                    <button 
                      className="btn btn-sm btn-outline-danger rounded-pill ms-2"
                      onClick={stopListening}
                    >
                      Arrêter
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .chat-container::-webkit-scrollbar {
          width: 6px;
        }
        .chat-container::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .chat-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .typing-dots {
          animation: dots 1.5s infinite;
        }
        @keyframes dots {
          0%, 20% { content: '.'; }
          40%, 60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;