"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface VideoDescriptionProps {
  description: string | null;
  compactViews: string;
  expandViews: string;
  compactDate: string;
  expandDate: string;
}

const VideoDescription = ({
  description,
  compactDate,
  compactViews,
  expandDate,
  expandViews,
}: VideoDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      onClick={() => setIsExpanded((expand) => !expand)}
      className="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition"
    >
      <div className="flex gap-x-2 text-sm mb-2">
        <span className="font-semibold">
          {isExpanded ? expandViews : compactViews} views
        </span>
        <span className="font-semibold">
          {isExpanded ? expandDate : compactDate}
        </span>
      </div>
      <article className="relative">
        <p
          className={cn(
            "text-sm whitespace-pre-wrap font-semibold",
            !isExpanded && "line-clamp-2"
          )}
        >
          {description || "No Description"}
        </p>
        <span className="mt-4 text-sm font-semibold">
          {isExpanded ? <>Show less</> : <>Show More</>}
        </span>
      </article>
    </div>
  );
};

export default VideoDescription;
