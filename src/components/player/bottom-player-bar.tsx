"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Shuffle,
  SkipBack,
  Play as PlayIcon,
  Pause as PauseIcon,
  SkipForward,
  Repeat,
  Repeat1,
  ListMusic,
  Volume2,
  VolumeX,
  Heart,
} from "lucide-react";
import { useAudioPlayer } from "@/contexts/audio-player-context";

const BottomPlayerBar = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    playSong,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    skipNext,
    skipPrevious,
  } = useAudioPlayer();

  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Load the Karan Aujla song on component mount
  useEffect(() => {
    const loadKaranAujlaSong = async () => {
      try {
        const response = await fetch("/api/songs?id=37");
        if (response.ok) {
          const songs = await response.json();
          if (songs && songs.length > 0) {
            playSong(songs[0]);
          }
        }
      } catch (error) {
        console.error("Error loading song:", error);
      }
    };

    loadKaranAujlaSong();
  }, []);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTo(percent * duration);
  };

  const handleProgressBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingProgress(true);
    handleProgressBarClick(e);
  };

  const handleVolumeBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setVolume(percent);
  };

  const handleVolumeBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingVolume(true);
    handleVolumeBarClick(e);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingProgress) {
        const progressBar = document.getElementById("progress-bar");
        if (progressBar) {
          const rect = progressBar.getBoundingClientRect();
          const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          seekTo(percent * duration);
        }
      }
      if (isDraggingVolume) {
        const volumeBar = document.getElementById("volume-bar");
        if (volumeBar) {
          const rect = volumeBar.getBoundingClientRect();
          const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          setVolume(percent);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingProgress(false);
      setIsDraggingVolume(false);
    };

    if (isDraggingProgress || isDraggingVolume) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingProgress, isDraggingVolume, duration]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      {/* Player Controls Bar */}
      <div className="flex h-[90px] items-center justify-between bg-black px-4 text-white">
        {/* Left: Now Playing */}
        <div className="flex w-[30%] min-w-[180px] items-center gap-3">
          {currentSong && (
            <>
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded">
                {currentSong.coverImageUrl ? (
                  <Image
                    src={currentSong.coverImageUrl}
                    alt={currentSong.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent/10" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">
                  {currentSong.title}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {currentSong.artistName}
                </div>
              </div>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`text-muted-foreground transition hover:text-white ${
                  isLiked ? "text-primary" : ""
                }`}
              >
                <Heart
                  size={16}
                  fill={isLiked ? "currentColor" : "none"}
                  className="transition-all"
                />
              </button>
            </>
          )}
        </div>

        {/* Center: Playback Controls */}
        <div className="flex w-[40%] max-w-[722px] flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`transition hover:text-white ${
                isShuffled ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Shuffle size={16} />
            </button>
            <button
              onClick={skipPrevious}
              className="text-muted-foreground transition hover:text-white"
            >
              <SkipBack fill="currentColor" size={16} />
            </button>
            <button
              onClick={togglePlay}
              disabled={!currentSong}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:opacity-50"
            >
              {isPlaying ? (
                <PauseIcon fill="black" size={16} />
              ) : (
                <PlayIcon fill="black" size={16} className="translate-x-px" />
              )}
            </button>
            <button
              onClick={skipNext}
              className="text-muted-foreground transition hover:text-white"
            >
              <SkipForward fill="currentColor" size={16} />
            </button>
            <button
              onClick={toggleRepeat}
              className={`transition hover:text-white ${
                repeatMode !== "off" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <RepeatIcon size={16} />
            </button>
          </div>
          <div className="flex w-full items-center gap-2">
            <span className="w-10 text-right text-[11px] text-muted-foreground">
              {formatTime(currentTime)}
            </span>
            <div
              id="progress-bar"
              className="group flex h-3 w-full cursor-pointer items-center"
              onMouseDown={handleProgressBarMouseDown}
            >
              <div className="relative h-1 w-full rounded-full bg-progress-track">
                <div
                  className="h-1 rounded-full bg-white transition-colors group-hover:bg-primary"
                  style={{ width: `${progressPercent}%` }}
                />
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ left: `${progressPercent}%`, transform: "translate(-50%, -50%)" }}
                />
              </div>
            </div>
            <span className="w-10 text-left text-[11px] text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Other Controls */}
        <div className="flex w-[30%] min-w-[180px] items-center justify-end gap-2">
          <button className="text-muted-foreground transition hover:text-white">
            <ListMusic size={16} />
          </button>
          <div className="flex w-[93px] items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-muted-foreground transition hover:text-white"
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div
              id="volume-bar"
              className="group flex h-3 w-full cursor-pointer items-center"
              onMouseDown={handleVolumeBarMouseDown}
            >
              <div className="relative h-1 w-full rounded-full bg-progress-track">
                <div
                  className="h-1 rounded-full bg-white transition-colors group-hover:bg-primary"
                  style={{ width: `${volumePercent}%` }}
                />
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ left: `${volumePercent}%`, transform: "translate(-50%, -50%)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BottomPlayerBar;