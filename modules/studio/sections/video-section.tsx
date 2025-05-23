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
import Link from "next/link";
import VideoThumbnail from "@/modules/videos/ui/components/video-thumbnail";
import { formatDateSimple } from "@/lib/utils";
import { Globe2Icon, LockIcon } from "lucide-react";
import { VideoSectionSkeleton } from "../ui/components/skeletons/video-section-skeleton";

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
    <Suspense fallback={<VideoSectionSkeleton count={4} />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <div className="rounded border w-full">
          <Table>
            <TableHeader>
              <TableRow className="h-12">
                <TableHead className="pl-6 w-[500px]">Video</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Views</TableHead>
                <TableHead className="text-center">Comments</TableHead>
                <TableHead className="text-center">Likes</TableHead>
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
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0 w-36 aspect-video">
                            <VideoThumbnail
                              thumbnailUrl={video?.thumbnailUrl}
                              previewUrl={video?.previewUrl}
                              title={video.title}
                              duration={video.duration ?? 0}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="line-clamp-1">{video.title}</span>
                            <div className="max-w-72">
                              <p className="w-full truncate text-xs text-muted-foreground ">
                                {video.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{video.muxStatus}</span>
                      </TableCell>
                      <TableCell className="capitalize">
                        <div className="flex items-center gap-2">
                          {video.visibility === "private" ? (
                            <LockIcon className="w-4 h-4" />
                          ) : (
                            <Globe2Icon className="w-4 h-4" />
                          )}
                          {video.visibility}
                        </div>
                      </TableCell>
                      <TableCell className="truncate">
                        {video.createdAt
                          ? formatDateSimple(new Date(video.createdAt))
                          : "Unknown"}
                      </TableCell>
                      <TableCell className="text-center">
                        {video.viewsCount}
                      </TableCell>
                      <TableCell className="text-center">
                        {video.commentsCount}
                      </TableCell>
                      <TableCell className="text-center">
                        {video.likesCount}
                      </TableCell>
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
