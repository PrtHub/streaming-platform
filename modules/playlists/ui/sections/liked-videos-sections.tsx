"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import VideoGridCard from "@/modules/videos/ui/components/video-grid-card";
import { trpc } from "@/trpc/client";
import VideoRowCard from "@/modules/videos/ui/components/video-row-card";

const LikedVideosSection = () => {
  const [videos, query] = trpc.playlists.getManyLiked.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <div>
          <section className="gap-4 gap-y-10 flex flex-col md:hidden">
            {videos.pages
              ?.flatMap((page) => page?.items)
              .map((video) => (
                <VideoGridCard key={video.id} data={video} />
              ))}
          </section>
          <section className="gap-4 hidden flex-col md:flex">
            {videos.pages
              ?.flatMap((page) => page?.items)
              .map((video) => (
                <VideoRowCard key={video.id} data={video} size={"compact"} />
              ))}
          </section>
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

export default LikedVideosSection;
