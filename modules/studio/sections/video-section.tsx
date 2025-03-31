"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
// Format date to relative time (e.g., "2 days ago")

const VideoSection = () => {
  const [data, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
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
        <div className="rounded border w-full">
          <Table>
            <TableHeader>
              <TableRow className="h-12">
                <TableHead className="pl-6 w-[500px]">Video</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead className="text-right pr-6">Likes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.pages.flatMap((page) =>
                page.items.map((video) => (
                  <Link
                    key={video.id}
                    href={`/studio/videos/${video.id}`}
                    legacyBehavior
                  >
                    <TableRow className="h-12 cursor-pointer">
                      <TableCell className="font-medium pl-6">
                        {video.title}
                      </TableCell>
                      <TableCell>{"Published"}</TableCell>
                      <TableCell>{"Public"}</TableCell>
                      <TableCell>
                        {video.updatedAt
                          ? formatRelativeTime(new Date(video.updatedAt))
                          : "Unknown"}
                      </TableCell>
                      <TableCell className="text-right">{0}</TableCell>
                      <TableCell className="text-right">{0}</TableCell>
                      <TableCell className="text-right pr-6">{0}</TableCell>
                    </TableRow>
                  </Link>
                ))
              )}
              {data.pages.flatMap((page) => page.items).length === 0 && (
                <TableRow className="h-24">
                  <TableCell colSpan={7} className="text-center">
                    No videos found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <InfiniteScroll
          isManual
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          fetchNextPage={query.fetchNextPage}
        />
      </ErrorBoundary>
    </Suspense>
  );
};

export default VideoSection;
