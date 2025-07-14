import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import StarryBackground from './shared/StarryBackground';

interface YouTubeTrack {
  id: string;
  title: string;
  artist: string;
}

const curatedTracks: YouTubeTrack[] = [
  {
    id: 'jfKfPfyJRdk',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    artist: 'Lofi Girl',
  },
  {
    id: '4xDzrJKXOOY',
    title: 'Synthwave Radio - Beats to Chill/Game to',
    artist: 'Lofi Girl',
  },
  {
    id: 'DWcJFNfaw9c',
    title: 'Deep Focus - Music For Coding, Programming, Working',
    artist: 'Chill Music Lab',
  },
  {
    id: '2gliGzb2_1I',
    title: 'Calm Piano Music 24/7: Study Music, Focus, Think, Meditation, Relaxing Music',
    artist: 'Yellow Brick Cinema',
  },
];

const FocusRoom = () => {
  // Pomodoro timer state
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isBreak, setIsBreak] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(5 * 60); // 5 minutes
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // YouTube player state
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Pomodoro timer logic
  useEffect(() => {
    if (isActive && !isBreak) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsBreak(true);
            setBreakTimeLeft(5 * 60);
            setSessionsCompleted((s) => s + 1);
            setIsPlaying(false);
            playCompletionSound();
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isBreak) {
      timerIntervalRef.current = setInterval(() => {
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
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isActive, isBreak]);

  // Play chime sound at end of session
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

  // Handle play/pause
  const handlePlayPause = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      if (isPlaying) {
        // Reload iframe to stop (simple approach)
        const currentSrc = iframe.src;
        iframe.src = currentSrc.replace('&autoplay=1', '&autoplay=0');
        setIsPlaying(false);
      } else {
        // Start playing
        const currentSrc = iframe.src;
        iframe.src = currentSrc.replace('&autoplay=0', '&autoplay=1');
        setIsPlaying(true);
      }
    }
  };

  // Handle track change
  const handleTrackChange = (direction: 'next' | 'prev') => {
    let newTrack;
    if (direction === 'next') {
      newTrack = (currentTrack + 1) % curatedTracks.length;
    } else {
      newTrack = currentTrack === 0 ? curatedTracks.length - 1 : currentTrack - 1;
    }
    setCurrentTrack(newTrack);
    setIsPlaying(false); // Reset play state when changing tracks
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get YouTube thumbnail
  const getThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  // Get YouTube embed URL
  const getEmbedUrl = (id: string) => {
    const autoplay = isPlaying ? '1' : '0';
    return `https://www.youtube.com/embed/${id}?autoplay=${autoplay}&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${id}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
      <StarryBackground />
      {/* Timer UI above the card */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-64 h-64 rounded-full border-8 border-white/20 flex items-center justify-center relative mb-4">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-mono font-bold text-white mb-2">
              {isBreak ? formatTime(breakTimeLeft) : formatTime(timeLeft)}
            </div>
            <div className="text-white/60 text-sm">
              {isActive ? 'Focus Time' : isBreak ? 'Break Time' : 'Ready to Focus'}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          {!isActive ? (
            <button
              onClick={() => {
                if (isBreak && breakTimeLeft > 0) {
                  alert(`Please wait ${Math.ceil(breakTimeLeft / 60)} more minutes before starting a new session.`);
                  return;
                }
                setIsActive(true);
                setIsBreak(false);
                setTimeLeft(25 * 60);
                // Auto-start music when focus session begins
                if (iframeRef.current) {
                  const iframe = iframeRef.current;
                  iframe.src = getEmbedUrl(curatedTracks[currentTrack].id).replace('&autoplay=0', '&autoplay=1');
                  setIsPlaying(true);
                }
              }}
              disabled={isBreak && breakTimeLeft > 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-5 w-5" />
              <span>Start Focus</span>
            </button>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setIsActive(false);
                  setIsPlaying(false);
                  if (iframeRef.current) {
                    const iframe = iframeRef.current;
                    iframe.src = getEmbedUrl(curatedTracks[currentTrack].id).replace('&autoplay=1', '&autoplay=0');
                  }
                }}
                className="flex items-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-yellow-700 transition-all"
              >
                <Pause className="h-5 w-5" />
                <span>Pause</span>
              </button>
            </div>
          )}
        </div>
        <div className="text-white/80 text-sm mt-4">
          Sessions completed: {sessionsCompleted}
        </div>
      </div>
      
      {/* YouTube Card UI */}
      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center">
        {/* Hidden YouTube Player */}
        <div style={{ position: 'absolute', left: '-9999px', width: 0, height: 0 }}>
          <iframe
            ref={iframeRef}
            src={getEmbedUrl(curatedTracks[currentTrack].id)}
            width="0"
            height="0"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube Player"
          />
        </div>
        
        {/* Card Content */}
        <div className="w-full flex flex-col items-center">
          {/* Thumbnail */}
          <div className="w-48 h-48 rounded-2xl overflow-hidden mb-6 shadow-lg">
            <img
              src={getThumbnail(curatedTracks[currentTrack].id)}
              alt={curatedTracks[currentTrack].title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Title & Artist */}
          <div className="text-center mb-4">
            <div className="font-bold text-lg text-gray-900 line-clamp-2">
              {curatedTracks[currentTrack].title}
            </div>
            <div className="text-gray-500 text-sm">
              {curatedTracks[currentTrack].artist}
            </div>
          </div>
          
          {/* Track indicator */}
          <div className="flex items-center space-x-2 mb-4">
            {curatedTracks.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentTrack ? 'bg-pink-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 w-full">
            <button
              onClick={() => handleTrackChange('prev')}
              className="p-3 bg-gray-100 rounded-full shadow-md text-gray-600 hover:bg-gray-200 transition-all"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="p-4 bg-pink-600 rounded-full shadow-lg text-white hover:bg-pink-700 transition-all"
            >
              {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
            </button>
            
            <button
              onClick={() => handleTrackChange('next')}
              className="p-3 bg-gray-100 rounded-full shadow-md text-gray-600 hover:bg-gray-200 transition-all"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
          
          {/* Playing status */}
          {isPlaying && (
            <div className="mt-4 text-center">
              <div className="text-pink-600 text-sm font-medium">Now Playing</div>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <div className="w-1 h-3 bg-pink-600 rounded-full animate-pulse"></div>
                <div className="w-1 h-4 bg-pink-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-2 bg-pink-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-4 bg-pink-600 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-1 h-3 bg-pink-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusRoom;