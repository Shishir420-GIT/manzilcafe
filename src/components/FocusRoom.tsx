import { useState, useEffect, useRef } from 'react';
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
    id: '2gliGzb2_1I',
    title: 'Calm Piano Music 24/7: Study Music, Focus, Think, Meditation, Relaxing Music',
    artist: 'Yellow Brick Cinema',
  },
  {
    id: 'rYEDA3JcQqw',
    title: 'Rain and Coffee Shop - Lofi Hip Hop Music',
    artist: 'Lofi Hip Hop',
  },
  {
    id: '36YnV9STBqc',
    title: 'Deep Focus Music - Binaural Beats Concentration Music',
    artist: 'Meditation Relax Music',
  },
  {
    id: 'fEvM-OUbaKs',
    title: 'Coffee House Jazz - Relaxing Instrumental Music',
    artist: 'Cafe Music BGM channel',
  },
  {
    id: '1fueZCTYkpA',
    title: 'Relaxing Piano Music for Studying and Concentration',
    artist: 'Yellow Brick Cinema',
  },
  {
    id: 'WPni755-Krg',
    title: 'Study Music - Improve Brain Power, Focus Music',
    artist: 'YellowBrickCinema',
  },
  {
    id: 'RgKAFK5djSk',
    title: 'Peaceful Guitar Music for Studying',
    artist: 'Soothing Relaxation',
  },
  {
    id: 'CfPxlb8-ZQ0',
    title: 'Zen Garden - Meditation and Study Music',
    artist: 'Meditation Music Zone',
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
        setApiLoaded(true);
        createPlayer();
        return;
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        // Script is loading, wait for it
        const checkAPI = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(checkAPI);
            setApiLoaded(true);
            createPlayer();
          }
        }, 100);
        return;
      }

      // Load YouTube IFrame API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // Set up the callback
      window.onYouTubeIframeAPIReady = () => {
        setApiLoaded(true);
        createPlayer();
      };
    };

    const createPlayer = () => {
      try {
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
      
      {/* Header - Mobile Responsive */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
        <div className="flex items-start justify-between">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-text-inverse/80 hover:text-text-inverse bg-black/30 px-3 py-2 md:px-4 md:py-2 rounded-full shadow transition"
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Hidden YouTube Player */}
          <div style={{ position: 'absolute', left: '-9999px', width: 0, height: 0 }}>
            <div id="youtube-player" />
          </div>

          {/* Desktop Music Player - Hidden on Mobile */}
          <div className="hidden lg:block bg-warm-white rounded-2xl shadow-2xl p-4 max-w-sm">
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
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  onClick={handlePlayPause}
                  disabled={!isPlayerReady || !apiLoaded}
                  className="p-3 bg-orange-accent rounded-full shadow-lg text-text-inverse hover:bg-orange-accent/90 transition-all disabled:opacity-50"
                  style={{ minHeight: '48px', minWidth: '48px' }}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => handleTrackChange('next')}
                  className="p-2 bg-cream-secondary rounded-full shadow-sm text-text-secondary hover:bg-cream-tertiary transition-all"
                  style={{ minHeight: '44px', minWidth: '44px' }}
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

          {/* Minimal Music Player for Mobile/Tablet - Top Right */}
          <div className="lg:hidden bg-warm-white/90 backdrop-blur-sm rounded-xl shadow-lg p-2 flex items-center space-x-2">
            {/* Small thumbnail */}
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
              <img
                src={getThumbnail(curatedTracks[currentTrack].id)}
                alt={curatedTracks[currentTrack].title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Controls only */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleTrackChange('prev')}
                className="p-1.5 bg-cream-secondary rounded-full shadow-sm text-text-secondary hover:bg-cream-tertiary transition-all"
                style={{ minHeight: '36px', minWidth: '36px' }}
              >
                <SkipBack className="h-3 w-3" />
              </button>
              <button
                onClick={handlePlayPause}
                disabled={!isPlayerReady || !apiLoaded}
                className="p-2 bg-orange-accent rounded-full shadow-md text-text-inverse hover:bg-orange-accent/90 transition-all disabled:opacity-50"
                style={{ minHeight: '40px', minWidth: '40px' }}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                onClick={() => handleTrackChange('next')}
                className="p-1.5 bg-cream-secondary rounded-full shadow-sm text-text-secondary hover:bg-cream-tertiary transition-all"
                style={{ minHeight: '36px', minWidth: '36px' }}
              >
                <SkipForward className="h-3 w-3" />
              </button>
            </div>

            {/* Error/Loading indicators */}
            {playerError && (
              <div className="text-error text-xs px-2 py-1 bg-red-100 rounded text-center">
                Error
              </div>
            )}
            {!apiLoaded && (
              <div className="text-text-muted text-xs px-2 py-1 bg-cream-secondary rounded text-center">
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Music Player - Bottom Sheet Style */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30 bg-warm-white rounded-2xl shadow-2xl p-4 border border-cream-tertiary">
        <div className="flex items-center justify-between">
          {/* Track info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0">
              <img
                src={getThumbnail(curatedTracks[currentTrack].id)}
                alt={curatedTracks[currentTrack].title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-text-primary truncate">
                {curatedTracks[currentTrack].title}
              </div>
              <div className="text-text-secondary text-xs truncate">
                {curatedTracks[currentTrack].artist}
              </div>
            </div>
          </div>

          {/* Track indicators */}
          <div className="flex items-center space-x-1 mx-4">
            {curatedTracks.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === currentTrack ? 'bg-orange-accent' : 'bg-cream-tertiary'
                }`}
              />
            ))}
          </div>

          {/* Playing status indicator */}
          {isPlaying && (
            <div className="flex items-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 h-3 bg-orange-accent rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timer UI - Mobile Optimized with bottom padding for mobile player */}
      <div className="mb-8 lg:mb-8 pb-24 lg:pb-8 flex flex-col items-center z-10 px-4">
        <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full border-4 sm:border-6 md:border-8 border-warm-white/20 flex items-center justify-center relative mb-6">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-text-inverse mb-2">
              {isBreak ? formatTime(breakTimeLeft) : formatTime(timeLeft)}
            </div>
            <div className="text-text-inverse/60 text-sm sm:text-base md:text-lg">
              {isActive ? 'Focus Time' : isBreak ? 'Break Time' : 'Ready to Focus'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4 md:space-x-6">
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
              className="flex items-center space-x-3 bg-gradient-to-r from-orange-accent to-golden-accent text-text-inverse px-8 sm:px-10 py-4 sm:py-5 rounded-full font-semibold hover:from-orange-accent/90 hover:to-golden-accent/90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              style={{ minHeight: '56px', minWidth: '160px' }}
            >
              <Play className="h-6 w-6 sm:h-7 sm:w-7" />
              <span className="text-base sm:text-lg font-bold">Start Focus</span>
            </button>
          ) : (
            <div className="flex space-x-4 sm:space-x-6">
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
                className="flex items-center space-x-3 bg-golden-accent text-text-inverse px-6 sm:px-8 py-4 rounded-full font-semibold hover:bg-golden-accent/90 transition-all shadow-lg"
                style={{ minHeight: '56px', minWidth: '140px' }}
              >
                <Pause className="h-6 w-6 sm:h-7 sm:w-7" />
                <span className="text-base sm:text-lg font-bold">Pause</span>
              </button>
              <button
                onClick={() => {
                  setIsActive(false);
                  setTimeLeft(25 * 60);
                  setIsBreak(false);
                  if (playerRef.current && isPlayerReady && apiLoaded) {
                    try {
                      playerRef.current.pauseVideo();
                    } catch (error) {
                      console.error('Error pausing video:', error);
                    }
                  }
                }}
                className="flex items-center space-x-2 bg-red-500 text-text-inverse px-4 sm:px-6 py-4 rounded-full font-semibold hover:bg-red-600 transition-all shadow-lg"
                style={{ minHeight: '56px' }}
              >
                <span className="text-base sm:text-lg font-bold">Reset</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="text-text-inverse/80 text-sm sm:text-base mt-6 text-center">
          <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
            <span className="font-medium">Sessions completed: </span>
            <span className="font-bold text-golden-accent">{sessionsCompleted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusRoom;