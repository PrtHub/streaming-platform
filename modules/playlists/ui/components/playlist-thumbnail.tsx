import Image from "next/image";
import { cn } from "@/lib/utils";
import { THUMBNAIL_URL } from "@/constants";
import { ListVideoIcon, Play } from "lucide-react";
import { useMemo } from "react";

interface PlaylistThumbnailProps {
  imageUrl?: string | null;
  title: string;
  videosCount: number;
  className?: string;
}

const PlaylistThumbnail = ({
  imageUrl,
  title,
  videosCount,
  className,
}: PlaylistThumbnailProps) => {
  const formatViews = useMemo(() => {
    return Intl.NumberFormat("en-US", {
      notation: "compact",
    }).format(videosCount);
  }, [videosCount]);

  return (
    <div className={cn("relative pt-3", className)}>
      <section className="relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] rounded-xl overflow-hidden bg-white/10 aspect-video" />
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98%] rounded-xl overflow-hidden bg-white/10 aspect-video" />

        <div className="w-full aspect-video relative rounded-xl overflow-hidden">
          <Image
            src={imageUrl || THUMBNAIL_URL}
            alt={title}
            fill
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/70  opacity-0 group-hover:opacity-100 transition-opacity  flex items-center justify-center ">
            <div className="flex items-center gap-x-2">
              <Play className="size-4 text-white fill-white" />
              <span className="text-xs text-white font-medium">Play all</span>
            </div>
          </div>
        </div>
      </section>

      <section className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80  text-white text-xs  font-medium flex items-center gap-x-1">
        <ListVideoIcon className="size-4" />
        <span>{formatViews} videos</span>
      </section>
    </div>
  );
};

export default PlaylistThumbnail;
