"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import VideoRowCard from "../video-row-card";
import VideoGridCard from "../video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";

interface VideoSuggestionsProps {
  videoId: string;
  isManual?: boolean;
}

const VideoSuggestions = ({ videoId, isManual }: VideoSuggestionsProps) => {
  const [suggestions, query] =
    trpc.suggestions.getMany.useSuspenseInfiniteQuery(
      {
        videoId,
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  return (
    <>
      <section className="hidden xl:block space-y-3">
        {suggestions.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoRowCard key={video.id} data={video} size="compact" />
          ))}
      </section>
      <section className="hidden xl:hidden md:block space-y-3">
        {suggestions.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoRowCard key={video.id} data={video} size="default" />
          ))}
      </section>
      <section className="block md:hidden space-y-3">
        {suggestions.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))}
      </section>
      <InfiniteScroll
        isManual={isManual}
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
      />
    </>
  );
};

export default VideoSuggestions;
