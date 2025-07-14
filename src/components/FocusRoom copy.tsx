import { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { User as UserType } from '../types';

// Add this at the top of the file to fix the linter error for window.YT
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// No props needed for FocusRoom
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
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
            if (playerRef.current && isPlayerReady) playerRef.current.pauseVideo();
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
  }, [isActive, isBreak, isPlayerReady]);

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
    } catch {}
  };

  // Load YouTube IFrame API and create player
  useEffect(() => {
    let scriptTag: HTMLScriptElement | null = null;
    setPlayerLoading(true);
    if (!window.YT) {
      scriptTag = document.createElement('script');
      scriptTag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(scriptTag);
    }
    window.onYouTubeIframeAPIReady = () => {
      if (playerRef.current) playerRef.current.destroy();
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: curatedTracks[currentTrack].id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            setPlayerLoading(false);
            setDuration(event.target.getDuration());
            setCurrentTime(event.target.getCurrentTime());
          },
          onStateChange: (event: any) => {
            if (event.data === 1) setIsPlaying(true); // playing
            if (event.data === 2) setIsPlaying(false); // paused
            if (event.data === 0) setIsPlaying(false); // ended
          },
        },
      });
    };
    return () => {
      if (playerRef.current) playerRef.current.destroy();
      if (scriptTag) document.body.removeChild(scriptTag);
    };
    // eslint-disable-next-line
  }, []);

  // Update duration and currentTime
  useEffect(() => {
    if (isPlayerReady && playerRef.current) {
      setDuration(playerRef.current.getDuration());
      setCurrentTime(playerRef.current.getCurrentTime());
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (playerRef.current && isPlaying) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlayerReady, isPlaying]);

  // Change track when currentTrack changes
  useEffect(() => {
    if (playerRef.current && isPlayerReady) {
      playerRef.current.loadVideoById(curatedTracks[currentTrack].id);
      setIsPlaying(false);
      setDuration(playerRef.current.getDuration());
      setCurrentTime(0);
    }
    // eslint-disable-next-line
  }, [currentTrack, isPlayerReady]);

  // Player controls
  const handlePlayPause = () => {
    if (!isPlayerReady || !playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlayerReady || !playerRef.current) return;
    const seekTo = parseFloat(e.target.value);
    playerRef.current.seekTo(seekTo, true);
    setCurrentTime(seekTo);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get YouTube thumbnail
  const getThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
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
                if (isPlayerReady && playerRef.current) playerRef.current.playVideo();
              }}
              disabled={isBreak && breakTimeLeft > 0 || !isPlayerReady}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-5 w-5" />
              <span>Start Focus</span>
            </button>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={() => setIsActive(false)}
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
          <div id="youtube-player" />
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
            <div className="font-bold text-lg text-gray-900">
              {curatedTracks[currentTrack].title}
            </div>
            <div className="text-gray-500 text-sm">
              {curatedTracks[currentTrack].artist}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full flex flex-col items-center mb-4">
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-pink-600 h-2 rounded-lg appearance-none bg-gray-200"
              disabled={!isPlayerReady}
            />
            <div className="flex justify-between w-full text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          {/* Controls */}
          <div className="flex items-center justify-center w-full">
            <button
              onClick={handlePlayPause}
              disabled={!isPlayerReady}
              className="p-4 bg-pink-600 rounded-full shadow-lg text-white hover:bg-pink-700 transition-all disabled:opacity-50"
            >
              {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusRoom;