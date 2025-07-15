import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Mic, Play, Pause } from 'lucide-react';
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
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    return unsubscribe;
  }, [cafeId]); // eslint-disable-line react-hooks/exhaustive-deps

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

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${cafeId}`)
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
          
          // Only add if not already in optimistic messages
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            
            // Fetch sender info for real-time message
            if (newMessage.sender_id === 'ai-bartender') {
              return [...prev, {
                ...newMessage,
                sender: { id: 'ai-bartender', name: 'AI Bartender', avatar_url: null }
              }];
            } else {
              // Fetch user info asynchronously
              supabase
                .from('users')
                .select('id, name, avatar_url')
                .eq('id', newMessage.sender_id)
                .single()
                .then(({ data: sender }) => {
                  setMessages(current => 
                    current.map(msg => 
                      msg.id === newMessage.id 
                        ? { ...msg, sender: sender || { id: newMessage.sender_id, name: 'Unknown User', avatar_url: null } }
                        : msg
                    )
                  );
                });
              
              return [...prev, { ...newMessage, sender: { id: newMessage.sender_id, name: 'Loading...', avatar_url: null } }];
            }
          });
          
          // Remove from optimistic messages
          setOptimisticMessages(prev => prev.filter(msg => msg.content !== newMessage.content));
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
      // Add optimistic message immediately
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        cafe_id: cafeId,
        sender_id: currentUser.id,
        content: messageText,
        message_type: 'user',
        timestamp: new Date().toISOString(),
        sender: currentUser
      };
      
      setOptimisticMessages(prev => [...prev, optimisticMessage]);

      // Send user message
      const { error } = await supabase
        .from('messages')
        .insert({
          cafe_id: cafeId,
          sender_id: currentUser.id,
          content: messageText,
          message_type: 'user',
        });

      if (error) {
        // Remove optimistic message on error
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        throw error;
      }

      // Check if message is directed to AI bartender
      if (messageText.toLowerCase().includes('@bartender') || 
          messageText.toLowerCase().includes('bartender')) {
        await sendAIResponse(messageText, cafeId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore message on error
      // Optimistic message already removed above
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

      // Get recent messages for context
      const recentMessages = messages.slice(-5).map(m => `${m.sender?.name || 'User'}: ${m.content}`).join('\n');
      const cafeContext = `Recent conversation:\n${recentMessages}`;
      
      const aiResponse = await generateAIResponse(userMessage, cafeContext, currentUser.id || undefined);

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

  // Combine real messages with optimistic messages
  const allMessages = [...messages, ...optimisticMessages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageIcon = (messageType: string) => {
    switch (messageType) {
      case 'ai':
        return <Bot className="h-4 w-4 text-amber-600" />;
      case 'system':
        return <Coffee className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-warm-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {allMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-start space-x-3 ${
                message.sender_id === currentUser.id ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.message_type === 'ai' 
                    ? 'bg-golden-accent/20' 
                    : message.sender_id === currentUser.id
                    ? 'bg-orange-accent/20'
                    : 'bg-cream-secondary'
                }`}>
                  {getMessageIcon(message.message_type)}
                </div>
              </div>
              
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
                
                <div className={`px-4 py-2 rounded-lg ${
                  message.sender_id === currentUser.id
                    ? 'bg-orange-accent text-text-inverse'
                    : message.message_type === 'ai'
                    ? 'bg-golden-accent/10 text-text-primary border border-golden-accent/30'
                    : message.message_type === 'voice'
                    ? 'bg-green-50 text-green-900 border border-green-200'
                    : 'bg-cream-secondary text-text-primary'
                }`}>
                  {message.message_type === 'voice' && message.audio_data ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleAudioPlayback(message.id, message.audio_data || '')}
                        className="p-1 rounded-full hover:bg-green-200 transition-colors"
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
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-cream-tertiary p-4">
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
          Tip: Type "@bartender" for AI help, or use the mic button for voice messages
        </p>
      </div>
    </div>
  );
};

export default Chat;