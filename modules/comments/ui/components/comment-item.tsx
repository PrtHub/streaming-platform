"use client";

import Link from "next/link";
import { useState } from "react";
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
  ChevronDownIcon,
  ChevronUpIcon,
  Edit,
  MoreVerticalIcon,
  ThumbsDown,
  ThumbsUp,
  Trash2Icon,
} from "lucide-react";
import CommentForm from "./comment-form";
import CommentReplies from "./comment-replies";

interface CommentItemProps {
  comment: CommentManyOutput["items"][number];
  variant?: "reply" | "comment";
}

const CommentItem = ({ variant = "comment", comment }: CommentItemProps) => {
  const clerk = useClerk();
  const { userId } = useAuth();
  const utils = trpc.useUtils();

  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      if (variant === "comment") {
        toast.success("Comment removed!");
      } else {
        toast.success("Reply removed!");
      }
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
            className={cn("size-10", variant === "reply" && "size-7")}
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
            {variant === "comment" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsReplyOpen(true)}
                className={cn("cursor-pointer bg-transparent font-semibold")}
              >
                Reply
              </Button>
            )}
          </section>
        </article>
        {userId === comment.user.clerkId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <Button variant="ghost" size="icon" disabled={remove.isPending}>
                <MoreVerticalIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full" align="start" side="left">
              <DropdownMenuItem
                className="w-full cursor-pointer"
                onClick={() => {}}
                disabled={remove.isPending}
              >
                {" "}
                <Edit className="w-4 h-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="w-full cursor-pointer"
                onClick={() => remove.mutate({ id: comment.id })}
                disabled={remove.isPending}
              >
                {" "}
                <Trash2Icon className="w-4 h-4" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <section className="ml-11">
        {comment.repliesCount > 0 && (
          <Button
            variant={"tertiary"}
            size="sm"
            type="button"
            onClick={() => setIsRepliesOpen((prev) => !prev)}
            className="cursor-pointer font-semibold"
          >
            {isRepliesOpen ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
            {comment.repliesCount}{" "}
            {comment.repliesCount === 1 ? "reply" : "replies"}
          </Button>
        )}
      </section>
      {variant === "comment" && isReplyOpen && (
        <div className="mt-4 pl-14">
          <CommentForm
            variant="reply"
            parentId={comment.id}
            videoId={comment.videoId}
            onCancel={() => setIsReplyOpen(false)}
            onSuccess={() => setIsReplyOpen(false)}
          />
        </div>
      )}
      {comment.repliesCount > 0 && isRepliesOpen && variant === "comment" && (
        <CommentReplies parentId={comment.id} videoId={comment.videoId} />
      )}
    </div>
  );
};

export default CommentItem;
