import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, ArrowLeft } from 'lucide-react';
import GlitterParticles from './shared/GlitterParticles';
import { useNavigate } from 'react-router-dom';

// Declare YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const curatedTracks = [
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

function getThumbnail(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

const FocusRoom = () => {
  // Pomodoro timer state
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(5 * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // YouTube player state
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const playerRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Timer logic
  useEffect(() => {
    if (isActive && !isBreak) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsBreak(true);
            setBreakTimeLeft(5 * 60);
            setSessionsCompleted((s) => s + 1);
            if (playerRef.current && isPlayerReady) {
              try {
                playerRef.current.pauseVideo();
                setIsPlaying(false);
              } catch (error) {
                console.error('Error pausing video:', error);
              }
            }
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

  // Initialize YouTube Player
  useEffect(() => {
    const initializeYouTubeAPI = () => {
      // Check if API is already loaded
      if (window.YT && window.YT.Player) {
        console.log('YouTube API already loaded');
        setApiLoaded(true);
        createPlayer();
        return;
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        console.log('YouTube API script already loading, waiting...');
        // Script is loading, wait for it
        const checkAPI = setInterval(() => {
          if (window.YT && window.YT.Player) {
            console.log('YouTube API loaded after waiting');
            clearInterval(checkAPI);
            setApiLoaded(true);
            createPlayer();
          }
        }, 100);
        return;
      }

      console.log('Loading YouTube IFrame API...');
      // Load YouTube IFrame API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // Set up the callback
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready callback triggered');
        setApiLoaded(true);
        createPlayer();
      };
    };

    const createPlayer = () => {
      try {
        console.log('Creating YouTube player...');
        // Destroy existing player
        if (playerRef.current) {
          playerRef.current.destroy();
        }

        // Create new player
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
            loop: 1,
            playlist: curatedTracks[currentTrack].id,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              console.log('YouTube player ready');
              setIsPlayerReady(true);
              setPlayerError(null);
              
              // Set volume to reasonable level
              try {
                event.target.setVolume(50);
              } catch (error) {
                console.error('Error setting volume:', error);
              }
            },
            onStateChange: (event: any) => {
              const state = event.data;
              console.log('Player state changed:', state);
              
              if (state === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (state === window.YT.PlayerState.PAUSED || state === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
              }
              
              // Handle video ended - loop or go to next
              if (state === window.YT.PlayerState.ENDED) {
                try {
                  event.target.playVideo(); // Loop current video
                } catch (error) {
                  console.error('Error restarting video:', error);
                }
              }
            },
            onError: (event: any) => {
              console.error('YouTube player error:', event.data);
              setPlayerError(`YouTube Error: ${event.data}`);
              const errorMessages: { [key: number]: string } = {
                2: 'Invalid video ID',
                5: 'HTML5 player error',
                100: 'Video not found or private',
                101: 'Video not allowed to be embedded',
                150: 'Video not allowed to be embedded',
              };
              
              setPlayerError(errorMessages[event.data] || 'Failed to load video');
              setIsPlaying(false);
              
              // Try next track on error
              setTimeout(() => {
                handleTrackChange('next');
              }, 2000);
            },
          },
        });
      } catch (error) {
        console.error('Error creating YouTube player:', error);
        setPlayerError('YouTube player failed to initialize');
      }
    };

    initializeYouTubeAPI();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
    };
  }, []);

  // Handle track changes
  useEffect(() => {
    if (playerRef.current && isPlayerReady && apiLoaded) {
      try {
        console.log('Loading new track:', curatedTracks[currentTrack].title);
        playerRef.current.loadVideoById({
          videoId: curatedTracks[currentTrack].id,
          startSeconds: 0,
        });
        setIsPlaying(false);
        setPlayerError(null);
      } catch (error) {
        console.error('Error loading video:', error);
        setPlayerError('Failed to load track');
      }
    }
  }, [currentTrack, isPlayerReady, apiLoaded]);

  // Play completion sound
  const playCompletionSound = () => {
    try {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioCtx) {
        const audioContext = new AudioCtx();
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
      }
    } catch (error) {
      console.error('Error playing completion sound:', error);
    }
  };

  // Player controls
  const handlePlayPause = () => {
    if (!isPlayerReady || !playerRef.current || !apiLoaded) {
      setPlayerError('Player not ready. Please wait...');
      return;
    }

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (error) {
      console.error('Error controlling playback:', error);
      setPlayerError('Playback control failed');
    }
  };

  const handleTrackChange = (direction: 'next' | 'prev') => {
    setCurrentTrack((prev) => {
      if (direction === 'next') {
        return (prev + 1) % curatedTracks.length;
      } else {
        return (prev - 1 + curatedTracks.length) % curatedTracks.length;
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-coffee-dark via-coffee-medium to-orange-accent relative z-0">
      <GlitterParticles />
      
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-text-inverse/80 hover:text-text-inverse bg-black/30 px-4 py-2 rounded-full shadow transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Music Player - Top Right */}
      <div className="absolute top-6 right-6 z-20 w-80 bg-warm-white rounded-2xl shadow-2xl p-4">
        {/* Hidden YouTube Player */}
        <div style={{ position: 'absolute', left: '-9999px', width: 0, height: 0 }}>
          <div id="youtube-player" />
        </div>

        {/* Player Content */}
        <div className="flex flex-col items-center">
          {/* Thumbnail */}
          <div className="w-20 h-20 rounded-xl overflow-hidden mb-3 shadow-md">
            <img
              src={getThumbnail(curatedTracks[currentTrack].id)}
              alt={curatedTracks[currentTrack].title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Artist */}
          <div className="text-center mb-3">
            <div className="font-bold text-sm text-text-primary line-clamp-2 mb-1">
              {curatedTracks[currentTrack].title}
            </div>
            <div className="text-text-secondary text-xs">
              {curatedTracks[currentTrack].artist}
            </div>
          </div>

          {/* Error Display */}
          {playerError && (
            <div className="text-error text-xs text-center mb-2 p-2 bg-red-50 rounded">
              {playerError}
            </div>
          )}

          {/* Loading State */}
          {!apiLoaded && (
            <div className="text-text-muted text-xs text-center mb-2 p-2 bg-cream-secondary rounded">
              Loading YouTube API...
            </div>
          )}

          {/* Track Indicators */}
          <div className="flex items-center space-x-1 mb-3">
            {curatedTracks.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === currentTrack ? 'bg-orange-accent' : 'bg-cream-tertiary'
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => handleTrackChange('prev')}
              className="p-2 bg-cream-secondary rounded-full shadow-sm text-text-secondary hover:bg-cream-tertiary transition-all"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={handlePlayPause}
              disabled={!isPlayerReady || !apiLoaded}
              className="p-3 bg-orange-accent rounded-full shadow-lg text-text-inverse hover:bg-orange-accent/90 transition-all disabled:opacity-50"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={() => handleTrackChange('next')}
              className="p-2 bg-cream-secondary rounded-full shadow-sm text-text-secondary hover:bg-cream-tertiary transition-all"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Playing Status */}
          {isPlaying && (
            <div className="mt-2 text-center">
              <div className="text-orange-accent text-xs font-medium">Now Playing</div>
              <div className="flex items-center justify-center space-x-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 h-2 bg-orange-accent rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timer UI */}
      <div className="mb-8 flex flex-col items-center z-10">
        <div className="w-64 h-64 rounded-full border-8 border-warm-white/20 flex items-center justify-center relative mb-4">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-mono font-bold text-text-inverse mb-2">
              {isBreak ? formatTime(breakTimeLeft) : formatTime(timeLeft)}
            </div>
            <div className="text-text-inverse/60 text-sm">
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
                if (isPlayerReady && playerRef.current && apiLoaded) {
                  try {
                    playerRef.current.playVideo();
                  } catch (error) {
                    console.error('Error starting playback:', error);
                  }
                }
              }}
              disabled={isBreak && breakTimeLeft > 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-accent to-golden-accent text-text-inverse px-8 py-4 rounded-full font-semibold hover:from-orange-accent/90 hover:to-golden-accent/90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-5 w-5" />
              <span>Start Focus</span>
            </button>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setIsActive(false);
                  if (playerRef.current && isPlayerReady && apiLoaded) {
                    try {
                      playerRef.current.pauseVideo();
                    } catch (error) {
                      console.error('Error pausing video:', error);
                    }
                  }
                }}
                className="flex items-center space-x-2 bg-golden-accent text-text-inverse px-6 py-3 rounded-full font-semibold hover:bg-golden-accent/90 transition-all"
              >
                <Pause className="h-5 w-5" />
                <span>Pause</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="text-text-inverse/80 text-sm mt-4">
          Sessions completed: {sessionsCompleted}
        </div>
      </div>
    </div>
  );
};

export default FocusRoom;