"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface VideoPlayerProps {
  playbackId?: string | null;
  thumbnailUrl?: string | null;
  autoPlay?: boolean;
  onPlay?: () => void;
}

const VideoPlayer = ({
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay,
}: VideoPlayerProps) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [playbackId]);

  if (!playbackId) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black/20">
        <div className="text-center p-4">
          <p className="text-muted-foreground">No video available</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black/20 relative">
        {thumbnailUrl ? (
          <div className="absolute inset-0">
            <Image
              src={thumbnailUrl}
              alt="Video thumbnail"
              fill
              className="object-cover opacity-30"
            />
          </div>
        ) : null}
        <div className="text-center p-4 relative z-10">
          <p className="text-muted-foreground">Unable to load video</p>
          <p className="text-xs text-muted-foreground mt-1">
            The video may still be processing
          </p>
        </div>
      </div>
    );
  }

  return (
    <MuxPlayer
      playbackId={playbackId}
      poster={thumbnailUrl ?? "/placeholder.svg"}
      playerInitTime={0}
      thumbnailTime={0}
      autoPlay={autoPlay}
      onPlay={onPlay}
      accentColor="#FF2056"
      className="w-full h-full object-contain"
      onError={() => setHasError(true)}
    />
  );
};

export default VideoPlayer;
