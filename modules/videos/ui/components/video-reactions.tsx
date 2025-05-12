import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";
import { ThumbsUp, ThumbsDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VideoGetOneOutput } from "../../types";
import { trpc } from "@/trpc/client";

interface VideoReactionsProps {
  videoId: string;
  likes: number;
  dislikes: number;
  viewerReactions: VideoGetOneOutput["viewerReaction"];
}

const VideoReactions = ({
  videoId,
  likes,
  dislikes,
  viewerReactions,
}: VideoReactionsProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const like = trpc.videoReactions.like.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
      utils.playlists.getManyLiked.invalidate();
    },
    onError: (err) => {
      toast.error(err?.message);

      if (err?.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const dislike = trpc.videoReactions.dislike.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
      utils.playlists.getManyLiked.invalidate();
    },
    onError: (err) => {
      toast.error(err?.message);

      if (err?.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  return (
    <div className="flex items-center flex-none sm:mt-2">
      <Button
        type="button"
        variant="ghost"
        disabled={like.isPending || dislike.isPending}
        onClick={() => like.mutate({ id: videoId })}
        className={cn(
          "rounded-l-full border border-r-0 rounded-r-none pr-4 cursor-pointer"
        )}
      >
        <ThumbsUp
          className={cn("size-5", viewerReactions === "like" && "fill-white")}
        />
        <span className="text-white font-semibold text-lg ml-2">{likes}</span>
      </Button>
      <Separator orientation="vertical" className="bg-[#333]/50" />
      <Button
        type="button"
        variant="ghost"
        disabled={dislike.isPending || like.isPending}
        onClick={() => dislike.mutate({ id: videoId })}
        className={cn(
          " rounded-l-none  rounded-r-full border border-l-0 pl-3 cursor-pointer"
        )}
      >
        <ThumbsDown
          className={cn(
            "size-5",
            viewerReactions === "dislike" && "fill-white"
          )}
        />
        <span className="text-white font-semibold text-lg ml-2">
          {dislikes}
        </span>
      </Button>
    </div>
  );
};

export default VideoReactions;
