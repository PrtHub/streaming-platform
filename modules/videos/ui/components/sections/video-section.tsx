"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import VideoPlayer from "../video-player";

const VideoSection = ({ videoId }: { videoId: string }) => {
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });
  return (
    <Suspense fallback={<p>Loading....</p>}>
      <ErrorBoundary fallback={<p>Something went wrong!</p>}>
        <>
          <div
            className={cn(
              "aspect-video bg-black overflow-hidden relative rounded-md",
              video.muxStatus !== "ready" && "rounded-b-none"
            )}
          >
            <VideoPlayer
              autoPlay
              onPlay={() => {}}
              playbackId={video.muxPlaybackId}
              thumbnailUrl={video.thumbnailUrl}
            />
          </div>
        </>
      </ErrorBoundary>
    </Suspense>
  );
};

export default VideoSection;
