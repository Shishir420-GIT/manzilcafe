import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Clock, Coffee, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserType } from '../types';

interface FocusRoomProps {
  currentUser: UserType;
  onExit: () => void;
}

const FocusRoom = ({ currentUser, onExit }: FocusRoomProps) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(5 * 60); // 5 minutes break
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Lofi music tracks (using royalty-free/creative commons tracks)
  const lofiTracks = [
    {
      name: "Peaceful Study",
      artist: "Lofi Cafe"
    },
    {
      name: "Calm Focus",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Placeholder
      artist: "Study Beats"
    },
    {
      name: "Deep Work",
                    <span>Enter Focus Room</span>
      artist: "Focus Flow"
    }
  ];

  useEffect(() => {
    if (isActive && !isBreak) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Session completed
            setIsActive(false);
            setIsBreak(true);
            setBreakTimeLeft(5 * 60);
            setSessionsCompleted(prev => prev + 1);
            setIsMusicPlaying(false);
            if (audioRef.current) {
              audioRef.current.pause();
            }
            // Play completion sound
            playCompletionSound();
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isBreak) {
      intervalRef.current = setInterval(() => {
        setBreakTimeLeft((prev) => {
          if (prev <= 1) {
            setIsBreak(false);
            return 5 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isBreak]);

  const playCompletionSound = () => {
    // Create a simple completion sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const startSession = () => {
    if (isBreak && breakTimeLeft > 0) {
      alert(`Please wait ${Math.ceil(breakTimeLeft / 60)} more minutes before starting a new session.`);
      return;
    }
    setIsActive(true);
    setIsBreak(false);
    setTimeLeft(25 * 60);
    setIsMusicPlaying(true);
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const pauseSession = () => {
    setIsActive(false);
    setIsMusicPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    setIsMusicPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current.play();
        setIsMusicPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % lofiTracks.length);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((25 * 60 - timeLeft) / (25 * 60)) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Spaces</span>
          </button>
          <div className="text-white/80 text-sm">
            Sessions completed: {sessionsCompleted}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Focus Room
          </h1>
          <p className="text-xl text-white/80 mb-8">
            25-minute deep focus sessions with calming lofi music
          </p>
        </motion.div>

        {/* Timer Display */}
        <motion.div
          className="relative mb-12"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-64 h-64 rounded-full border-8 border-white/20 flex items-center justify-center relative">
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="120"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="120"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgressPercentage() / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-mono font-bold text-white mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-white/60 text-sm">
                {isActive ? 'Focus Time' : 'Ready to Focus'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Break Timer */}
        <AnimatePresence>
          {isBreak && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 text-center"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Coffee className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-xl font-semibold text-white mb-2">Break Time</h3>
                <p className="text-white/80 mb-4">
                  Take a break! Next session available in:
                </p>
                <div className="text-2xl font-mono font-bold text-yellow-400">
                  {formatTime(breakTimeLeft)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center space-x-6 mb-8">
          {!isActive ? (
            <button
              onClick={startSession}
              disabled={isBreak && breakTimeLeft > 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-5 w-5" />
              <span>Start Focus</span>
            </button>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={pauseSession}
                className="flex items-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-yellow-700 transition-all"
              >
                <Pause className="h-5 w-5" />
                <span>Pause</span>
              </button>
              <button
                onClick={stopSession}
                className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-all"
              >
                <Square className="h-5 w-5" />
                <span>Stop</span>
              </button>
            </div>
          )}
        </div>

        {/* Music Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Lofi Music</h3>
            <div className="flex space-x-2">
              <button
                onClick={toggleMute}
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <div className="text-white font-medium">{lofiTracks[currentTrack].name}</div>
            <div className="text-white/60 text-sm">{lofiTracks[currentTrack].artist}</div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={nextTrack}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 6v12l10-6z"/>
                <path d="M17 6h2v12h-2z"/>
              </svg>
            </button>
            <button
              onClick={toggleMusic}
              className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
            >
              {isMusicPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={nextTrack}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 18V6l-10 6z"/>
                <path d="M7 6h-2v12h2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={lofiTracks[currentTrack].url}
          loop
          preload="auto"
          onEnded={nextTrack}
        />
      </div>

      {/* Stats */}
      <div className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center space-x-2 text-white/80">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            Total focus time: {Math.floor((sessionsCompleted * 25) / 60)}h {(sessionsCompleted * 25) % 60}m
          </span>
        </div>
      </div>
    </div>
  );
};

export default FocusRoom;