import React, { useMemo } from "react";
import { VideoGetManyOutput } from "../../types";
import Link from "next/link";
import UserAvatar from "@/components/user-avatar";
import UserInfo from "@/modules/users/ui/components/user-info";
import { formatRelativeTime } from "@/lib/utils";
import VideoMenu from "./video-menu";

interface VideoInfoProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

const VideoInfo = ({ data, onRemove }: VideoInfoProps) => {
  const formatViews = useMemo(() => {
    return Intl.NumberFormat("en-US", {
      notation: "compact",
    }).format(data.viewsCount);
  }, [data.viewsCount]);
  return (
    <section className="flex gap-3">
      <Link href={`/users/${data.userId}`}>
        <UserAvatar image={data.user.imageUrl} alt={data.user.name} />
      </Link>
      <div className="min-w-0 flex-1 ">
        <Link href={`/videos/${data.id}`}>
          <h3 className="line-clamp-1 lg:line-clamp-2 font-semibold break-words text-base">
            {data.title}
          </h3>
        </Link>
        <Link href={`/users/${data.userId}`}>
          <UserInfo name={data.user.name} size={"default"} />
        </Link>
        <Link href={`/videos/${data.id}`}>
          <p className="text-sm line-clamp-1 text-muted-foreground">
            {formatViews} views &bull; {formatRelativeTime(data.createdAt)}
          </p>
        </Link>
      </div>
      <div className="shrink-0">
        <VideoMenu videoId={data.id} onRemove={onRemove} />
      </div>
    </section>
  );
};

export default VideoInfo;
