import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Clock, Coffee, ArrowLeft, Youtube, Search, SkipForward, SkipBack } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserType } from '../types';

interface FocusRoomProps {
  currentUser: UserType;
  onExit: () => void;
}

interface YouTubeTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
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
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showMusicSearch, setShowMusicSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isYouTubeLoggedIn, setIsYouTubeLoggedIn] = useState(false);
  const [customPlaylist, setCustomPlaylist] = useState<YouTubeTrack[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const youtubePlayerRef = useRef<any>(null);

  // Default lofi tracks with YouTube video IDs
  const defaultLofiTracks: YouTubeTrack[] = [
    {
      id: 'jfKfPfyJRdk',
      title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
      artist: 'Lofi Girl',
      thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg',
      duration: 'Live Stream'
    },
    {
      id: '4xDzrJKXOOY',
      title: 'Synthwave Radio - Beats to Chill/Game to',
      artist: 'Lofi Girl',
      thumbnail: 'https://img.youtube.com/vi/4xDzrJKXOOY/mqdefault.jpg',
      duration: 'Live Stream'
    },
    {
      id: 'DWcJFNfaw9c',
      title: 'Deep Focus - Music For Coding, Programming, Working',
      artist: 'Chill Music Lab',
      thumbnail: 'https://img.youtube.com/vi/DWcJFNfaw9c/mqdefault.jpg',
      duration: '3:00:00'
    },
    {
      id: '2gliGzb2_1I',
      title: 'Calm Piano Music 24/7: Study Music, Focus, Think, Meditation, Relaxing Music',
      artist: 'Yellow Brick Cinema',
      thumbnail: 'https://img.youtube.com/vi/2gliGzb2_1I/mqdefault.jpg',
      duration: 'Live Stream'
    }
  ];

  const currentPlaylist = customPlaylist.length > 0 ? customPlaylist : defaultLofiTracks;

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize YouTube player when API is ready
    (window as any).onYouTubeIframeAPIReady = () => {
      youtubePlayerRef.current = new (window as any).YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: currentPlaylist[currentTrack].id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event: any) => {
            console.log('YouTube player ready');
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              nextTrack();
            }
          },
        },
      });
    };

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && !isBreak && !sessionEnded) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Session completed - auto exit and start break timer
            setIsActive(false);
            setSessionEnded(true);
            setIsBreak(true);
            setBreakTimeLeft(5 * 60);
            setSessionsCompleted(prev => prev + 1);
            setIsMusicPlaying(false);
            if (youtubePlayerRef.current) {
              youtubePlayerRef.current.pauseVideo();
            }
            // Play completion sound
            playCompletionSound();
            // Auto exit after session completion
            setTimeout(() => {
              onExit();
            }, 2000);
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isBreak && !sessionEnded) {
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
  }, [isActive, isBreak, sessionEnded, onExit]);

  const playCompletionSound = () => {
    try {
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
    } catch (error) {
      console.log('Audio context not available');
    }
  };

  const startSession = () => {
    if (isBreak && breakTimeLeft > 0) {
      alert(`Please wait ${Math.ceil(breakTimeLeft / 60)} more minutes before starting a new session.`);
      return;
    }
    setIsActive(true);
    setIsBreak(false);
    setSessionEnded(false);
    setTimeLeft(25 * 60);
    setIsMusicPlaying(true);
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.playVideo();
    }
  };

  const pauseSession = () => {
    setIsActive(false);
    setIsMusicPlaying(false);
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.pauseVideo();
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    setSessionEnded(false);
    setIsMusicPlaying(false);
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.pauseVideo();
    }
  };

  const toggleMusic = () => {
    if (youtubePlayerRef.current) {
      if (isMusicPlaying) {
        youtubePlayerRef.current.pauseVideo();
        setIsMusicPlaying(false);
      } else {
        youtubePlayerRef.current.playVideo();
        setIsMusicPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (youtubePlayerRef.current) {
      if (isMuted) {
        youtubePlayerRef.current.unMute();
        setIsMuted(false);
      } else {
        youtubePlayerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  const nextTrack = () => {
    const nextIndex = (currentTrack + 1) % currentPlaylist.length;
    setCurrentTrack(nextIndex);
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.loadVideoById(currentPlaylist[nextIndex].id);
      if (isMusicPlaying) {
        youtubePlayerRef.current.playVideo();
      }
    }
  };

  const previousTrack = () => {
    const prevIndex = currentTrack === 0 ? currentPlaylist.length - 1 : currentTrack - 1;
    setCurrentTrack(prevIndex);
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.loadVideoById(currentPlaylist[prevIndex].id);
      if (isMusicPlaying) {
        youtubePlayerRef.current.playVideo();
      }
    }
  };

  const selectTrack = (index: number) => {
    setCurrentTrack(index);
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.loadVideoById(currentPlaylist[index].id);
      if (isMusicPlaying) {
        youtubePlayerRef.current.playVideo();
      }
    }
  };

  const handleYouTubeLogin = () => {
    // In a real implementation, this would integrate with YouTube's OAuth
    alert('YouTube login would be implemented here with proper OAuth integration');
    setIsYouTubeLoggedIn(true);
  };

  const searchYouTubeMusic = async () => {
    // In a real implementation, this would use YouTube Data API
    // For demo purposes, we'll simulate search results
    const mockResults: YouTubeTrack[] = [
      {
        id: 'jfKfPfyJRdk',
        title: `${searchQuery} - Lofi Mix`,
        artist: 'Search Result',
        thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg',
        duration: '2:30:00'
      }
    ];
    
    setCustomPlaylist(mockResults);
    setCurrentTrack(0);
    setShowMusicSearch(false);
    setSearchQuery('');
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
      {/* Hidden YouTube Player */}
      <div id="youtube-player" style={{ display: 'none' }}></div>

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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMusicSearch(true)}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Search Music</span>
            </button>
            <div className="text-white/80 text-sm">
              Sessions: {sessionsCompleted}
            </div>
          </div>
        </div>
      </div>

      {/* Music Search Modal */}
      <AnimatePresence>
        {showMusicSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Search YouTube Music</h3>
                <button
                  onClick={() => setShowMusicSearch(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {!isYouTubeLoggedIn && (
                <div className="mb-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700 mb-2">
                    For personalized playlists and better recommendations
                  </p>
                  <button
                    onClick={handleYouTubeLogin}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Youtube className="h-4 w-4" />
                    <span>Login to YouTube</span>
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for lofi, study music..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && searchYouTubeMusic()}
                  />
                  <button
                    onClick={searchYouTubeMusic}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  Popular searches: "lofi hip hop", "study music", "ambient focus", "piano relaxing"
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            25-minute deep focus sessions with YouTube music
          </p>
        </motion.div>

        {/* Session Completion Message */}
        <AnimatePresence>
          {sessionEnded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-8 text-center"
            >
              <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-8 border border-green-400/30">
                <Coffee className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Session Complete!</h3>
                <p className="text-white/80 mb-4">
                  Great job! You've completed a 25-minute focus session.
                </p>
                <p className="text-green-400 text-sm">
                  Returning to spaces in a moment...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer Display */}
        {!sessionEnded && (
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
        )}

        {/* Break Timer */}
        <AnimatePresence>
          {isBreak && !sessionEnded && (
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
        {!sessionEnded && (
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
        )}

        {/* YouTube Music Player */}
        {!sessionEnded && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Youtube className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-white">YouTube Music</h3>
                {isYouTubeLoggedIn && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                    Logged In
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {/* Current Track Display */}
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={currentPlaylist[currentTrack].thumbnail}
                alt={currentPlaylist[currentTrack].title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">
                  {currentPlaylist[currentTrack].title}
                </div>
                <div className="text-white/60 text-sm truncate">
                  {currentPlaylist[currentTrack].artist}
                </div>
                <div className="text-white/40 text-xs">
                  {currentPlaylist[currentTrack].duration}
                </div>
              </div>
            </div>

            {/* Music Controls */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                onClick={previousTrack}
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={toggleMusic}
                className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
              >
                {isMusicPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              <button
                onClick={nextTrack}
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            {/* Playlist */}
            <div className="max-h-32 overflow-y-auto">
              <div className="text-sm text-white/60 mb-2">Playlist:</div>
              <div className="space-y-1">
                {currentPlaylist.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(index)}
                    className={`w-full text-left p-2 rounded text-sm transition-colors ${
                      index === currentTrack
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="truncate">{track.title}</div>
                    <div className="text-xs opacity-60 truncate">{track.artist}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <div className="text-xs text-white/60">
                🎵 Powered by YouTube Music
              </div>
            </div>
          </div>
        )}
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