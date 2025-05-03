"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import VideoGridCard from "@/modules/videos/ui/components/video-grid-card";
import VideoRowCard from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";

interface ResultsSectionProps {
  query: string | undefined;
  categoryId: string | undefined;
}

const ResultsSection = ({ query, categoryId }: ResultsSectionProps) => {
  const isMobile = useIsMobile();
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
    <>
      {isMobile ? (
        <div className="flex flex-col gap-x-4 gap-y-8">
          {result.pages
            .flatMap((pages) => pages.items)
            .map((video) => (
              <div key={video.id}>
                <VideoGridCard key={video.id} data={video} />
              </div>
            ))}
        </div>
      ) : (
        <div className="flex flex-col gap-x-4 gap-y-8">
          {result.pages
            .flatMap((pages) => pages.items)
            .map((video) => (
              <div key={video.id}>
                <VideoRowCard key={video.id} data={video} size="default" />
              </div>
            ))}
        </div>
      )}
      <InfiniteScroll
        hasNextPage={resultQuery.hasNextPage}
        fetchNextPage={resultQuery.fetchNextPage}
        isFetchingNextPage={resultQuery.isFetchingNextPage}
      />
    </>
  );
};

export default ResultsSection;
