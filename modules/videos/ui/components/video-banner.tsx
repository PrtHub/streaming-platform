import { AlertTriangleIcon } from "lucide-react";
import { VideoGetOneOutput } from "../../types";

interface VideoBannerProps {
  status: VideoGetOneOutput["muxStatus"];
}

const VideoBanner = ({ status }: VideoBannerProps) => {
  if (status === "ready") return null;
  return (
    <div className="bg-yellow-500 w-full py-3 px-4 rounded-b-md flex items-center  gap-2">
      <AlertTriangleIcon className="h-4 w-4 text-black" />
      <p className="text-xs md:text-sm text-black line-clamp-1 truncate font-medium">
        Thie video is still being processed!
      </p>
    </div>
  );
};

export default VideoBanner;
