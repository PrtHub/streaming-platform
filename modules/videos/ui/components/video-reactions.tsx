import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const VideoReactions = () => {
  const vieweReaction: "like" | "dislike" = "like";

  return (
    <div className="flex items-center flex-none sm:mt-2">
      <Button
        variant="ghost"
        className={cn(
          "rounded-l-full border border-r-0 rounded-r-none pr-4 cursor-pointer"
        )}
        type="button"
      >
        <ThumbsUp
          className={cn("size-5", vieweReaction === "like" && "fill-white")}
        />
        <span className="text-white font-semibold text-lg ml-2">1</span>
      </Button>
      <Separator orientation="vertical" className="bg-[#333]/50" />
      <Button
        variant="ghost"
        className={cn(
          " rounded-l-none  rounded-r-full border border-l-0 pl-3 cursor-pointer"
        )}
        type="button"
      >
        <ThumbsDown
          className={cn("size-5", vieweReaction !== "like" && "fill-white")}
        />
        <span className="text-white font-semibold text-lg ml-2">0</span>
      </Button>
    </div>
  );
};

export default VideoReactions;
