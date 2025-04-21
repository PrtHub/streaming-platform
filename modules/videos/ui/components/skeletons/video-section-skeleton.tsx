import { Skeleton } from "@/components/ui/skeleton";

const VideoSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Video Player Skeleton */}
      <Skeleton className="w-full aspect-video rounded-xl bg-black/20" />
      {/* Video Banner Skeleton (if present) */}
      <Skeleton className="w-full h-10 rounded-b-md bg-yellow-500/50" />
      {/* Top Row Skeleton */}
      <div className="flex flex-col gap-4">
        {/* Title */}
        <Skeleton className="h-8 w-3/4 rounded-md" />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Video Owner */}
          <div className="flex items-center gap-3">
            <Skeleton className="size-14 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          {/* Reactions & Menu */}
          <section className="flex gap-2 sm:mt-2">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </section>
        </div>
        {/* Description */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
};


export default VideoSectionSkeleton;
