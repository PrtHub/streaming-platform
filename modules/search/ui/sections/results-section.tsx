"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import VideoGridCard from "@/modules/videos/ui/components/video-grid-card";
import VideoRowCard from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";

interface ResultsSectionProps {
  query: string | undefined;
  categoryId: string | undefined;
}

const ResultsSection = ({ query, categoryId }: ResultsSectionProps) => {
  const [result, resultQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    {
      query,
      categoryId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <Suspense key={`${query}-${categoryId}`} fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <>
          <div className="flex flex-col gap-x-4 gap-y-8 md:hidden">
            {result.pages
              .flatMap((pages) => pages.items)
              .map((video) => (
                <div key={video.id}>
                  <VideoGridCard key={video.id} data={video} />
                </div>
              ))}
          </div>
          <div className="hidden md:flex flex-col gap-x-4 gap-y-8">
            {result.pages
              .flatMap((pages) => pages.items)
              .map((video) => (
                <div key={video.id}>
                  <VideoRowCard key={video.id} data={video} size="default" />
                </div>
              ))}
          </div>
        </>
        <InfiniteScroll
          hasNextPage={resultQuery.hasNextPage}
          fetchNextPage={resultQuery.fetchNextPage}
          isFetchingNextPage={resultQuery.isFetchingNextPage}
        />
      </ErrorBoundary>
    </Suspense>
  );
};

export default ResultsSection;
