"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import VideoGridCard from "@/modules/videos/ui/components/video-grid-card";
import { trpc } from "@/trpc/client";

const SubscriptionVideosSection = () => {
  const [videos, query] =
    trpc.videos.getManySubscriptions.useSuspenseInfiniteQuery(
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
          <section className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1980px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-5">
            {videos.pages
              ?.flatMap((page) => page?.items)
              .map((video) => (
                <VideoGridCard key={video.id} data={video} />
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

export default SubscriptionVideosSection;
