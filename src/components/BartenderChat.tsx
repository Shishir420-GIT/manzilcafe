import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Mic, Play, Pause, X, ArrowLeft } from 'lucide-react';
import { generateAIResponse } from '../lib/gemini';
import { User as UserType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceRecorder from './VoiceRecorder';
import { checkRateLimit } from '../lib/rateLimiter';

interface BartenderChatProps {
  currentUser: UserType;
  onClose: () => void;
}

interface BartenderMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  audio_data?: string;
  message_type: 'text' | 'voice';
}

const BartenderChat = ({ currentUser, onClose }: BartenderChatProps) => {
  const [messages, setMessages] = useState<BartenderMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        content: "Hello! I'm your AI bartender. I can help you with drink recommendations, chat about anything, or just keep you company. What would you like to talk about?",
        sender: 'ai',
        timestamp: new Date().toISOString(),
        message_type: 'text'
      }
    ]);
  }, []);

  const quickResponses = [
    "What drinks do you recommend?",
    "Tell me about your coffee",
    "What's popular today?",
    "I need a pick-me-up"
  ];

  const sendQuickResponse = (response: string) => {
    setNewMessage(response);
    // Trigger send after a brief delay
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }, 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    const messageText = newMessage.trim();
    
    // Check rate limit for AI requests
    const rateLimitCheck = checkRateLimit(currentUser.id, 'ai_request');
    if (!rateLimitCheck.allowed) {
      alert(rateLimitCheck.error);
      return;
    }

    setNewMessage('');
    setLoading(true);
    setAiThinking(true);

    try {
      // Add user message
      const userMessage: BartenderMessage = {
        id: Date.now().toString(),
        content: messageText,
        sender: 'user',
        timestamp: new Date().toISOString(),
        message_type: 'text'
      };

      setMessages(prev => [...prev, userMessage]);

      // Generate AI response
      const aiResponse = await generateAIResponse(messageText, "You are a friendly AI bartender. Provide helpful, conversational responses. Keep responses concise but engaging.", currentUser.id);

      // Add AI response
      const aiMessage: BartenderMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        message_type: 'text'
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setAiThinking(false);
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      setAiThinking(false);
    } finally {
      setLoading(false);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    try {
      // Check rate limit for voice messages
      const rateLimitCheck = checkRateLimit(currentUser.id, 'voice_message');
      if (!rateLimitCheck.allowed) {
        alert(rateLimitCheck.error);
        return;
      }

      setLoading(true);
      setAiThinking(true);

      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        // Add user voice message
        const userMessage: BartenderMessage = {
          id: Date.now().toString(),
          content: `[Voice message - ${Math.floor(duration)}s]`,
          sender: 'user',
          timestamp: new Date().toISOString(),
          message_type: 'voice',
          audio_data: base64Audio
        };

        setMessages(prev => [...prev, userMessage]);

        // Try to transcribe the voice message (basic implementation)
        // In a production app, you'd use a proper speech-to-text service
        let transcribedText = "User sent a voice message";
        
        // For demo purposes, we'll simulate transcription based on duration
        if (duration < 3) {
          transcribedText = "Hello";
        } else if (duration < 6) {
          transcribedText = "What do you recommend?";
        } else {
          transcribedText = "Tell me about your drinks";
        }

        const aiResponse = await generateAIResponse(
          transcribedText, 
          "You are a friendly AI bartender. The user just sent a voice message. Respond naturally and helpfully.",
          currentUser.id
        );

        const aiMessage: BartenderMessage = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          message_type: 'text'
        };

        setTimeout(() => {
          setMessages(prev => [...prev, aiMessage]);
          setAiThinking(false);
        }, 1000);
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error sending voice message:', error);
      setAiThinking(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleAudioPlayback = (messageId: string, audioData: string) => {
    const audio = audioRefs.current[messageId];
    
    if (audio) {
      if (playingAudio === messageId) {
        audio.pause();
        setPlayingAudio(null);
      } else {
        // Pause any currently playing audio
        Object.values(audioRefs.current).forEach(a => a.pause());
        setPlayingAudio(messageId);
        audio.play();
      }
    } else {
      // Create new audio element
      const newAudio = new Audio(audioData);
      audioRefs.current[messageId] = newAudio;
      
      newAudio.onended = () => setPlayingAudio(null);
      newAudio.onpause = () => setPlayingAudio(null);
      
      setPlayingAudio(messageId);
      newAudio.play();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-warm-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-coffee-dark to-coffee-medium p-4 text-text-inverse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6" />
                <div>
                  <h2 className="text-lg font-bold text-text-inverse">AI Bartender</h2>
                  <p className="text-sm text-text-inverse/90">Your personal virtual bartender</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream-primary/30">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex items-start space-x-3 ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'ai' 
                      ? 'bg-golden-accent/20' 
                      : 'bg-orange-accent/20'
                  }`}>
                    {message.sender === 'ai' ? (
                      <Bot className="h-4 w-4 text-golden-accent" />
                    ) : (
                      <User className="h-4 w-4 text-orange-accent" />
                    )}
                  </div>
                </div>
                
                <div className={`flex-1 max-w-xs lg:max-w-md ${
                  message.sender === 'user' ? 'text-right' : ''
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-text-secondary">
                      {message.sender === 'ai' ? 'AI Bartender' : currentUser.name}
                    </span>
                    <span className="text-xs text-text-muted">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-orange-accent text-text-inverse'
                      : message.message_type === 'voice'
                    ? 'bg-success/10 text-success border border-success/30'
                      : 'bg-warm-white text-text-primary border border-cream-tertiary'
                  }`}>
                    {message.message_type === 'voice' && message.audio_data ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAudioPlayback(message.id, message.audio_data!)}
                          className="p-1 rounded-full hover:bg-success/20 transition-colors"
                        >
                          {playingAudio === message.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <span className="text-sm">{message.content}</span>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* AI Thinking Indicator */}
          {aiThinking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-golden-accent/20 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-golden-accent" />
                </div>
              </div>
              <div className="flex-1 max-w-xs lg:max-w-md">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium text-text-secondary">AI Bartender</span>
                </div>
                <div className="bg-warm-white border border-cream-tertiary rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-golden-accent rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-golden-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-golden-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-text-muted">Thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Responses */}
        {messages.length === 1 && (
          <div className="border-t border-cream-tertiary p-4 bg-cream-primary/30">
            <div className="flex flex-wrap gap-2">
              {quickResponses.map((response, index) => (
                <button
                  key={index}
                  onClick={() => sendQuickResponse(response)}
                  className="px-3 py-1 bg-warm-white border border-cream-tertiary rounded-full text-xs text-text-secondary hover:bg-cream-secondary transition-colors"
                >
                  {response}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t border-cream-tertiary p-4 bg-warm-white">
          {showVoiceRecorder && (
            <div className="mb-4">
              <VoiceRecorder
                onSendVoiceMessage={sendVoiceMessage}
                onCancel={() => setShowVoiceRecorder(false)}
              />
            </div>
          )}
          
          <form onSubmit={sendMessage} className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask me anything... (drinks, recommendations, chat)"
              className="flex-1 px-4 py-2 border border-cream-tertiary rounded-lg focus:ring-2 focus:ring-orange-accent focus:border-transparent transition-all bg-cream-primary"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showVoiceRecorder ? 'bg-red-600 text-text-inverse' : 'bg-cream-secondary text-text-secondary hover:bg-cream-tertiary'
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="px-4 py-2 bg-orange-accent text-text-inverse rounded-lg hover:bg-orange-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="text-xs text-text-muted mt-2">
            Tip: Use the mic button for voice messages, or type to chat with your AI bartender
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BartenderChat;