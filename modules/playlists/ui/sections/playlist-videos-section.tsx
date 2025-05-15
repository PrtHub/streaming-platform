"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import VideoGridCard from "@/modules/videos/ui/components/video-grid-card";
import { trpc } from "@/trpc/client";
import VideoRowCard from "@/modules/videos/ui/components/video-row-card";
import { toast } from "sonner";

interface PlaylistVideosSectionProps {
  playlistId: string;
}

const PlaylistVideosSection = ({ playlistId }: PlaylistVideosSectionProps) => {
  const utils = trpc.useUtils();

  const [videos, query] =
    trpc.playlists.getPlaylistVideos.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
        playlistId: playlistId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const removeVideo = trpc.playlists.removeVideoToPlaylist.useMutation({
    onSuccess: (data) => {
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId: data.videoId });
      utils.playlists.getPlaylistVideos.invalidate({
        playlistId: data.playlistId,
      });
      utils.playlists.getOne.invalidate({ playlistId: data.playlistId });
      toast.success("Video removed from playlist");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <div>
          <section className="gap-4 gap-y-10 flex flex-col md:hidden">
            {videos.pages
              ?.flatMap((page) => page?.items)
              .map((video) => (
                <VideoGridCard
                  key={video.id}
                  data={video}
                  onRemove={() =>
                    removeVideo.mutate({
                      playlistId,
                      videoId: video.id,
                    })
                  }
                />
              ))}
          </section>
          <section className="gap-4 hidden flex-col md:flex">
            {videos.pages
              ?.flatMap((page) => page?.items)
              .map((video) => (
                <VideoRowCard
                  key={video.id}
                  data={video}
                  size={"compact"}
                  onRemove={() =>
                    removeVideo.mutate({
                      playlistId,
                      videoId: video.id,
                    })
                  }
                />
              ))}
          </section>
          {videos.pages?.flatMap((page) => page?.items).length === 0 && (
            <p className="text-muted-foreground">
              No video added to this playlist
            </p>
          )}
          <InfiniteScroll
            hasNextPage={query.hasNextPage}
            fetchNextPage={query.fetchNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
          />
        </div>
      </ErrorBoundary>
    </Suspense>
  );
};

export default PlaylistVideosSection;
