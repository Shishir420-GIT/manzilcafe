import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Mic, Play, Pause, Coffee } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateAIResponse } from '../lib/gemini';
import { Message, User as UserType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceRecorder from './VoiceRecorder';
import { checkRateLimit } from '../lib/rateLimiter';

interface ChatProps {
  cafeId: string;
  currentUser: UserType;
}

const Chat = ({ cafeId, currentUser }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Helper: localStorage key per cafe
  const storageKey = `chat_messages_${cafeId}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages from localStorage first
  useEffect(() => {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [cafeId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [messages, storageKey]);

  useEffect(() => {
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    return unsubscribe;
  }, [cafeId]); // Only depend on cafeId

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('timestamp', { ascending: true })
        .limit(50);

      if (error) throw error;
      
      // Fetch sender info for each message
      const messagesWithSenders = await Promise.all(
        (data || []).map(async (message) => {
          if (message.sender_id === 'ai-bartender') {
            return {
              ...message,
              sender: { id: 'ai-bartender', name: 'AI Bartender', avatar_url: null }
            };
          }
          
          const { data: sender } = await supabase
            .from('users')
            .select('id, name, avatar_url')
            .eq('id', message.sender_id)
            .single();
          
          return {
            ...message,
            sender: sender || { id: message.sender_id, name: 'Unknown User', avatar_url: null }
          };
        })
      );
      
      setMessages(messagesWithSenders);
      // localStorage will be updated by useEffect

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${cafeId}:${Date.now()}`) // Add timestamp to make channel unique
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `cafe_id=eq.${cafeId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // Skip if this is our own optimistic message (temp ID)
          if (newMessage.id.toString().startsWith('temp-')) {
            return;
          }
          
          // Fetch sender info for real-time message
          let messageWithSender;
          if (newMessage.sender_id === 'ai-bartender') {
            messageWithSender = {
              ...newMessage,
              sender: { id: 'ai-bartender', name: 'AI Bartender', avatar_url: null }
            };
          } else {
            const { data: sender } = await supabase
              .from('users')
              .select('id, name, avatar_url')
              .eq('id', newMessage.sender_id)
              .single();
            
            messageWithSender = {
              ...newMessage,
              sender: sender || { id: newMessage.sender_id, name: 'Unknown User', avatar_url: null }
            };
          }
          
          // Add message to state immediately using functional update
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const exists = prev.some(msg => msg.id === messageWithSender.id);
            if (exists) return prev;
            
            // Remove any optimistic messages that might match this real message
            const filteredPrev = prev.filter(msg => 
              !msg.id.toString().startsWith('temp-') || 
              msg.content !== messageWithSender.content ||
              Math.abs(new Date(msg.timestamp).getTime() - new Date(messageWithSender.timestamp).getTime()) > 5000
            );
            
            // Add new message and sort by timestamp
            const updated = [...filteredPrev, messageWithSender].sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading || !currentUser.id) return;

    const messageText = newMessage.trim();
    
    // Check rate limit for messages
    const rateLimitCheck = checkRateLimit(currentUser.id, 'message');
    if (!rateLimitCheck.allowed) {
      alert(rateLimitCheck.error);
      return;
    }

    setNewMessage('');
    setLoading(true);

    try {
      // Add optimistic message immediately for instant UI feedback
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        cafe_id: cafeId,
        sender_id: currentUser.id,
        content: messageText,
        message_type: 'user',
        timestamp: new Date().toISOString(),
        sender: currentUser
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      // localStorage will be updated by useEffect

      // Send user message to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          cafe_id: cafeId,
          sender_id: currentUser.id,
          content: messageText,
          message_type: 'user',
        })
        .select()
        .single();

      if (error) {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        throw error;
      }

      // Replace optimistic message with real message
      if (data) {
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? { ...data, sender: currentUser }
            : msg
        ));
        // localStorage will be updated by useEffect
      }

      // Check if message is directed to AI bartender
      if (messageText.toLowerCase().includes('@bartender') || 
          messageText.toLowerCase().includes('bartender')) {
        await sendAIResponse(messageText, cafeId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setLoading(false);
    }
  };

  const sendAIResponse = async (userMessage: string, cafeId: string) => {
    try {
      // Check rate limit for AI requests
      const rateLimitCheck = checkRateLimit(currentUser.id, 'ai_request');
      if (!rateLimitCheck.allowed) {
        console.warn('AI request rate limited:', rateLimitCheck.error);
        return;
      }

      // Get recent messages for context using functional update to avoid stale closure
      setMessages(currentMessages => {
        const recentMessages = currentMessages.slice(-5).map(m => `${m.sender?.name || 'User'}: ${m.content}`).join('\n');
        const cafeContext = `Recent conversation:\n${recentMessages}`;
        
        // Generate AI response asynchronously
        generateAIResponse(userMessage, cafeContext, currentUser.id || undefined)
          .then(aiResponse => {
            // Add slight delay to simulate AI thinking
            setTimeout(async () => {
              const { error } = await supabase
                .from('messages')
                .insert({
                  cafe_id: cafeId,
                  sender_id: 'ai-bartender',
                  content: aiResponse,
                  message_type: 'ai',
                });

              if (error) console.error('Error sending AI message:', error);
            }, 1000);
          })
          .catch(error => {
            console.error('Error generating AI response:', error);
          });
        
        // Return unchanged state
        return currentMessages;
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
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

      // Convert blob to base64 for storage (in production, you'd upload to storage)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        const { error } = await supabase
          .from('messages')
          .insert({
            cafe_id: cafeId,
            sender_id: currentUser.id,
            content: `[Voice message - ${Math.floor(duration)}s]`,
            message_type: 'voice',
            audio_data: base64Audio,
          });

        if (error) throw error;
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error sending voice message:', error);
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

  const getMessageIcon = (messageType: string) => {
    switch (messageType) {
      case 'ai':
        return <Bot className="h-4 w-4 text-golden-accent" />;
      case 'system':
        return <Coffee className="h-4 w-4 text-text-muted" />;
      default:
        return <User className="h-4 w-4 text-orange-accent" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-warm-white to-cream-primary">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-cream-primary/30 to-warm-white/50 relative">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27%23D4A574%27%3E%3Ccircle cx=%2720%27 cy=%2720%27 r=%273%27/%3E%3C/g%3E%3C/svg%3E')] bg-repeat pointer-events-none" />
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`flex items-start space-x-3 ${
                message.sender_id === currentUser.id ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <motion.div 
                className="flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 ${
                  message.message_type === 'ai' 
                    ? 'bg-gradient-to-br from-golden-accent to-yellow-400 border-golden-accent/30 shadow-golden-accent/20' 
                    : message.sender_id === currentUser.id
                    ? 'bg-gradient-to-br from-orange-accent to-red-400 border-orange-accent/30 shadow-orange-accent/20'
                    : 'bg-gradient-to-br from-cream-secondary to-cream-tertiary border-cream-tertiary shadow-cream-tertiary/20'
                }`}>
                  {message.message_type === 'ai' ? (
                    <Bot className="h-5 w-5 text-white" />
                  ) : message.message_type === 'system' ? (
                    <Coffee className="h-5 w-5 text-text-muted" />
                  ) : (
                    <span className="text-sm font-bold text-text-inverse">
                      {(message.sender?.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </motion.div>
              
              <div className={`flex-1 max-w-xs lg:max-w-md ${
                message.sender_id === currentUser.id ? 'text-right' : ''
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium text-text-secondary">
                    {message.message_type === 'ai' 
                      ? 'AI Bartender' 
                      : message.sender?.name || 'Anonymous'
                    }
                  </span>
                  <span className="text-xs text-text-muted">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <motion.div 
                  className={`px-4 py-3 rounded-2xl shadow-md backdrop-blur-sm relative ${
                    message.sender_id === currentUser.id
                      ? 'bg-gradient-to-br from-orange-accent to-red-400 text-text-inverse shadow-orange-accent/20'
                      : message.message_type === 'ai'
                      ? 'bg-gradient-to-br from-golden-accent/20 to-yellow-100/50 text-text-primary border border-golden-accent/30 shadow-golden-accent/10'
                      : message.message_type === 'voice'
                      ? 'bg-gradient-to-br from-success/20 to-green-100/50 text-success border border-success/30 shadow-success/10'
                      : 'bg-white/80 text-text-primary border border-cream-tertiary shadow-cream-tertiary/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {/* Message tail */}
                  <div className={`absolute top-3 w-3 h-3 rotate-45 ${
                    message.sender_id === currentUser.id
                      ? 'bg-gradient-to-br from-orange-accent to-red-400 -right-1'
                      : message.message_type === 'ai'
                      ? 'bg-gradient-to-br from-golden-accent/20 to-yellow-100/50 -left-1'
                      : 'bg-white/80 -left-1'
                  }`} />
                  {message.message_type === 'voice' && message.audio_data ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleAudioPlayback(message.id, message.audio_data || '')}
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
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-cream-tertiary p-4 bg-white/90 backdrop-blur-sm">
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
            placeholder="Type your message... (try @bartender for AI help)"
            className="flex-1 px-4 py-2 border border-cream-tertiary rounded-lg focus:ring-2 focus:ring-orange-accent focus:border-transparent transition-all bg-cream-primary text-text-primary placeholder-text-muted"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showVoiceRecorder ? 'bg-error text-text-inverse' : 'bg-cream-secondary text-text-secondary hover:bg-cream-tertiary'
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
          Tip: Type "@bartender" for AI help, or use the mic button for voice messages
        </p>
      </div>
    </div>
  );
};

export default Chat;