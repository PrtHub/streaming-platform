"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import VideoRowCard from "../video-row-card";

interface VideoSuggestionsProps {
  videoId: string;
}

const VideoSuggestions = ({ videoId }: VideoSuggestionsProps) => {
  const [suggestions] = trpc.suggestions.getMany.useSuspenseInfiniteQuery(
    {
      videoId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <section>
      {suggestions.pages
        .flatMap((page) => page.items)
        .map((video) => (
          <VideoRowCard key={video.id} data={video} size="compact" />
        ))}
    </section>
  );
};

export default VideoSuggestions;
