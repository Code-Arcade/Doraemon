import React, { useState, useEffect, useRef } from 'react';

export default function MusicPlayer({ isPlaying, setIsPlaying, volume, setVolume }) {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Default is ALWAYS COLLAPSED (symmetrical 56px circular badge)
  const [isExpanded, setIsExpanded] = useState(false);

  // Keep audio element's volume and loop synced
  useEffect(() => {
    if (audioRef.current) {
      // Soft background volume (never full blast)
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.loop = true;
    }
  }, [volume, isMuted]);

  // Sync play/pause state with audio element
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.volume = isMuted ? 0 : volume;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log("Audio autoplay waiting for user interaction:", err);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // First user interaction auto-start (if not explicitly disabled by user)
  useEffect(() => {
    const handleFirstGesture = () => {
      const isMutedPref = localStorage.getItem('dora_bgm_disabled');
      if (isMutedPref !== 'true' && !isPlaying) {
        setIsPlaying(true);
      }
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  // Clicking the 56px music badge toggles collapse / expand
  const handleBadgeClick = (e) => {
    e?.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const togglePlay = (e) => {
    e?.stopPropagation();
    if (isPlaying) {
      setIsPlaying(false);
      localStorage.setItem('dora_bgm_disabled', 'true');
    } else {
      setIsPlaying(true);
      localStorage.removeItem('dora_bgm_disabled');
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    localStorage.setItem('dora_bgm_volume', newVol.toString());
    if (isMuted && newVol > 0) {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = (e) => {
    e?.stopPropagation();
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const displayPercent = isMuted ? 0 : Math.round(volume * 100);

  return (
    <>
      <audio 
        ref={audioRef} 
        src="/audio/doraemon_theme.mp3" 
        preload="auto" 
        loop 
      />

      {/* Expanded Popover Gadget Card (Anchored above 56px badge) */}
      {isExpanded && (
        <div 
          className="dora-music-gadget-card" 
          role="dialog" 
          aria-label="Doraemon Music Gadget Console"
        >
          <div className="music-card-header">
            <div className="music-card-title">
              <span className="music-card-bell">🔔</span>
              <div>
                <h4>Doraemon Theme</h4>
                <span className="music-card-status">
                  {isPlaying ? 'Playing Soft Ambience 🎶' : 'Music Paused ⏸️'}
                </span>
              </div>
            </div>
            <button 
              type="button" 
              className="music-card-close-btn"
              onClick={handleBadgeClick}
              title="Collapse Music Player"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="music-card-body">
            {/* Play/Pause Button */}
            <button
              type="button"
              className={`music-card-play-btn ${isPlaying ? 'playing' : ''}`}
              onClick={togglePlay}
              title={isPlaying ? "Pause theme music" : "Play theme music"}
            >
              <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              <span>{isPlaying ? 'Pause Theme' : 'Play Theme'}</span>
            </button>

            {/* Soft Volume Control Box */}
            <div className="music-card-volume-wrap">
              <div className="music-volume-header">
                <button 
                  type="button" 
                  className="music-card-mute-btn" 
                  onClick={toggleMute}
                  title={isMuted ? "Unmute Sound" : "Mute Sound"}
                >
                  <i className={`fa-solid ${isMuted || displayPercent === 0 ? 'fa-volume-xmark' : displayPercent < 25 ? 'fa-volume-low' : 'fa-volume-high'}`}></i>
                </button>
                <span className="music-volume-label">
                  Soft BGM: <strong>{displayPercent}%</strong>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="dora-card-slider"
                title={`Soft volume: ${displayPercent}% (Capped at 40% for gentle ambience)`}
                aria-label="Soft background music volume"
              />
            </div>
          </div>
        </div>
      )}

      {/* Symmetrical 56px Circular Music Badge (Identical to 56px Helicopter Badge) */}
      <button 
        type="button"
        id="dora-music-spawner"
        className={`dora-music-badge ${isPlaying ? 'is-playing' : ''} ${isExpanded ? 'is-active' : ''}`}
        onClick={handleBadgeClick}
        title={isExpanded ? "Collapse Music Player 🐱" : "Doraemon Theme Music (Click to expand) 🐱🎶"}
        aria-label="Toggle Doraemon Theme Music Player"
      >
        <span className={`music-badge-icon ${isPlaying ? 'tinkling' : ''}`}>
          {isPlaying ? '🔔' : '🎵'}
        </span>
      </button>
    </>
  );
}
