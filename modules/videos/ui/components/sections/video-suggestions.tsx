"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";

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
      <div>{JSON.stringify(suggestions)}</div>
    </section>
  );
};

export default VideoSuggestions;
