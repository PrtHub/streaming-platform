import { cva, type VariantProps } from "class-variance-authority";

import { cn, formatRelativeTime } from "@/lib/utils";
import { VideoGetManyOutput } from "../../types";
import Link from "next/link";
import VideoThumbnail from "./video-thumbnail";
import UserAvatar from "@/components/user-avatar";
import UserInfo from "@/modules/users/ui/components/user-info";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VideoMenu from "./video-menu";
import { useMemo } from "react";

const videoRowCardVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      compact: "gap-2",
      default: "gap-4",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const thumbnailVariants = cva("flex-none relative", {
  variants: {
    size: {
      default: "w-[30%]",
      compact: "w-[168px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoRowSkeleton = () => {
  return (
    <div>
      <>Skeleton</>
    </div>
  );
};

const VideoRowCard = ({ data, size, onRemove }: VideoRowCardProps) => {
  const formatViews = useMemo(() => {
    return Intl.NumberFormat("en-US", {
      notation: "compact",
    }).format(data.viewsCount);
  }, [data.viewsCount]);

  return (
    <div className={cn(videoRowCardVariants({ size }))}>
      <Link
        href={`/videos/${data.id}`}
        className={cn(thumbnailVariants({ size }))}
      >
        <VideoThumbnail
          title={data.title}
          duration={data.duration ?? 0}
          thumbnailUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
        />
      </Link>
      <article className="flex-1 min-w-0">
        <section className="flex justify-between  gap-x-2">
          <Link href={`/videos/${data.id}`} className="flex-1 min-w-0">
            <h3
              className={cn(
                "line-clamp-2 font-semibold",
                size === "compact" ? "text-sm" : "text-base"
              )}
            >
              {data.title}
            </h3>
            {size === "default" && (
              <p className="line-clamp-1 text-xs text-muted-foreground mt-1">
                {formatViews} views &bull; {formatRelativeTime(data.createdAt)}
              </p>
            )}
            {size === "default" && (
              <>
                <div className="flex items-center gap-x-2 my-2">
                  <UserAvatar
                    image={data.user.imageUrl}
                    alt={data.user.name}
                    className="size-8"
                  />
                  <UserInfo name={data.user.name} size={"sm"} />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="line-clamp-2 text-xs text-muted-foreground w-fit">
                      {data.description || "No description"}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    From the video description
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {size === "compact" && (
              <div className="mt-1 text-muted-foreground">
                <UserInfo name={data.user.name} size="sm" />
              </div>
            )}
            {size === "compact" && (
              <p className="line-clamp-1 text-xs text-muted-foreground mt-1">
                {formatViews} views &bull; {formatRelativeTime(data.createdAt)}
              </p>
            )}
          </Link>
          <div className="flex-none">
            <VideoMenu videoId={data.id} onRemove={onRemove} />
          </div>
        </section>
      </article>
    </div>
  );
};

export default VideoRowCard;
