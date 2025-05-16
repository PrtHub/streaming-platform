"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import VideoGridCard from "@/modules/videos/ui/components/video-grid-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface UserVideosSectionProps {
  userId?: string;
}

const UserVideosSection = ({ userId }: UserVideosSectionProps) => {
  const [videos, query] = trpc.users.getManyVideos.useSuspenseInfiniteQuery(
    {
      userId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <Suspense key={userId} fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <div>
          <section className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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

export default UserVideosSection;
