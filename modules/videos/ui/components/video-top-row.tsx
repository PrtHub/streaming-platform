"use client";

import { useMemo } from "react";
import { VideoGetOneOutput } from "../../types";
import VideoDescription from "./video-description";
import VideoMenu from "./video-menu";
import VideoOwner from "./video-owner";
import VideoReactions from "./video-reactions";
import { formatDateSimple, formatRelativeTime } from "@/lib/utils";

interface VideoTopRowProps {
  video: VideoGetOneOutput;
}

const VideoTopRow = ({ video }: VideoTopRowProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(video.viewsCount);
  }, [video.viewsCount]);

  const extendedViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "standard",
    }).format(video.viewsCount);
  }, [video.viewsCount]);

  const compactDate = formatRelativeTime(video.createdAt || new Date());
  const extendedDate = formatDateSimple(video.createdAt || new Date());

  return (
    <div className="flex flex-col gap-4 mt-4">
      <h1 className="text-2xl font-semibold">{video.title}</h1>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <VideoOwner user={video.user} videoId={video.id} />
        <section className="flex overflow-x-auto sm:overflow-visible sm:justify-end  sm:min-h-[calc(50% - 6px)] pb-2 sm:pb-0 -mb-2 sm:mb-0  gap-2">
          <VideoReactions />
          <div className="sm:mt-2">
            <VideoMenu videoId={video.id} />
          </div>
        </section>
      </div>
      <VideoDescription
        description={video.description}
        compactDate={compactDate}
        expandDate={extendedDate}
        compactViews={compactViews}
        expandViews={extendedViews}
      />
    </div>
  );
};

export default VideoTopRow;
