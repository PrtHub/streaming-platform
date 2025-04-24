"use client";

import Link from "next/link";
import { CommentManyOutput } from "../../types";
import UserAvatar from "@/components/user-avatar";
import { cn, formatRelativeTime } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useAuth, useClerk } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Edit,
  MoreVerticalIcon,
  ThumbsDown,
  ThumbsUp,
  Trash2Icon,
} from "lucide-react";

interface CommentItemProps {
  comment: CommentManyOutput["items"][number];
}

const CommentItem = ({ comment }: CommentItemProps) => {
  const clerk = useClerk();
  const { userId } = useAuth();
  const utils = trpc.useUtils();

  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      toast.success("Comment removed!");
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (err) => {
      toast.success(err.message);
      if (err.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const like = trpc.commentReactions.like.useMutation({
    onSuccess: () => {
      toast.success("Liked!");
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (err) => {
      toast.success(err.message);
      if (err.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const dislike = trpc.commentReactions.dislike.useMutation({
    onSuccess: () => {
      toast.success("Disliked!");
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (err) => {
      toast.success(err.message);
      if (err.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            image={comment.user.imageUrl}
            alt={comment.user.name}
            className="size-10"
          />
        </Link>
        <article className="flex-1">
          <Link href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-sm pb-0.5">
                {comment.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
          </Link>
          <p className="text-[13px] font-medium">{comment.content}</p>
          <section className="flex items-center flex-none sm:mt-2 gap-x-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={like.isPending || dislike.isPending}
              onClick={() => like.mutate({ id: comment.id })}
              className={cn("cursor-pointer size-8")}
            >
              <ThumbsUp
                className={cn(
                  "",
                  comment.viewerReaction === "like" && "fill-white"
                )}
              />
              <span className="text-white font-semibold text-sm">
                {comment.likeCount}
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={"icon"}
              disabled={dislike.isPending || like.isPending}
              onClick={() => dislike.mutate({ id: comment.id })}
              className={cn(" cursor-pointer size-8")}
            >
              <ThumbsDown
                className={cn(
                  "",
                  comment.viewerReaction === "dislike" && "fill-white"
                )}
              />
              <span className="text-white font-semibold text-sm">
                {comment.dislikeCount}
              </span>
            </Button>
          </section>
        </article>
        {userId === comment.user.clerkId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <Button variant="ghost" size="icon">
                <MoreVerticalIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full" align="start" side="left">
              <DropdownMenuItem
                className="w-full cursor-pointer"
                onClick={() => {}}
              >
                {" "}
                <Edit className="w-4 h-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="w-full cursor-pointer"
                onClick={() => remove.mutate({ id: comment.id })}
              >
                {" "}
                <Trash2Icon className="w-4 h-4" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
