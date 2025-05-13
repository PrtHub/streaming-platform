"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import PlaylistGridCard from "../components/playlist-grid-card";

const PlaylistsSection = () => {
  const [playlists, query] = trpc.playlists.getMany.useSuspenseInfiniteQuery(
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
        <>
          <section className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1980px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-5">
            {playlists.pages
              ?.flatMap((page) => page?.items)
              .map((playlist) => (
                <PlaylistGridCard key={playlist.id} playlist={playlist} />
              ))}
          </section>
          <InfiniteScroll
            hasNextPage={query.hasNextPage}
            fetchNextPage={query.fetchNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
          />
        </>
      </ErrorBoundary>
    </Suspense>
  );
};

export default PlaylistsSection;
