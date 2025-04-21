"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import VideoPlayer from "../video-player";
import VideoBanner from "../video-banner";
import VideoTopRow from "../video-top-row";
import { useAuth } from "@clerk/nextjs";
import VideoSectionSkeleton from "../skeletons/video-section-skeleton";

const VideoSection = ({ videoId }: { videoId: string }) => {
  const { isSignedIn } = useAuth();
  const utils = trpc.useUtils();

  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

  const createView = trpc.videoViews.create.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    },
  });

  const handlePlay = () => {
    if (!isSignedIn) return;
    createView.mutate({ videoId });
  };

  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
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
              onPlay={handlePlay}
              playbackId={video.muxPlaybackId}
              thumbnailUrl={video.thumbnailUrl}
            />
          </div>
          <VideoBanner status={video.muxStatus} />
          <VideoTopRow video={video} />
        </>
      </ErrorBoundary>
    </Suspense>
  );
};

export default VideoSection;
