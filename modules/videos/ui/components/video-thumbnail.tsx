import { THUMBNAIL_URL } from "@/constants";
import { formatDuration } from "@/lib/utils";
import Image from "next/image";

interface VideoThumbnailProps {
  title: string;
  duration: number;
  thumbnailUrl?: string | null;
  previewUrl?: string | null;
}

const VideoThumbnail = ({
  thumbnailUrl,
  previewUrl,
  title,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
      <div className="relative overflow-hidden aspect-video rounded-xl w-full">
        <Image
          src={thumbnailUrl ?? THUMBNAIL_URL}
          alt={title}
          fill
          className="object-cover rounded-xl w-full h-full group-hover:opacity-0"
        />
        <Image
          src={previewUrl ?? thumbnailUrl ?? THUMBNAIL_URL}
          alt={title}
          fill
          className="object-cover rounded-xl w-full h-full opacity-0 group-hover:opacity-100"
          unoptimized={!!previewUrl}
        />
      </div>
      <div className="absolute bottom-1 right-1 bg-black/70 rounded px-2 py-[2px]">
        <span className="text-xs font-medium text-white">
          {formatDuration(duration)}
        </span>
      </div>
    </div>
  );
};

export default VideoThumbnail;
