"use client";

import Link from "next/link";
import { VideoGetOneOutput } from "../../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import SubscriptionButton from "@/modules/subscriptions/ui/components/subscription-button";
import UserInfo from "@/modules/users/ui/components/user-info";
import { useSubscriptions } from "@/modules/subscriptions/hooks/use-subscriptions";

interface VideoOwnerProps {
  user: VideoGetOneOutput["user"];
  videoId: string;
}

const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId: clerkUserId } = useAuth();

  const { isPending, onClick } = useSubscriptions({
    userId: user.id,
    isSubscribed: user.viewerSubscribed,
    fromVideoId: videoId,
  });

  return (
    <div className="flex items-center  justify-between sm:justify-start gap-5 min-h-0">
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-h-0">
          <Avatar className="size-14">
            <AvatarImage src={user.imageUrl} alt={user.name || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <article className="flex flex-col items-start">
            <UserInfo name={user.name} size={"lg"} />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {user.subscriberCount} Subscribers
            </span>
          </article>
        </div>
      </Link>
      {clerkUserId === user.clerkId ? (
        <Button
          size={"lg"}
          variant="default"
          className="rounded-full text-lg py-5 font-semibold cursor-pointer"
          asChild
        >
          <Link href={`/studio/videos/${videoId}`}>Edit Video</Link>
        </Button>
      ) : (
        <SubscriptionButton
          isSubscribed={user.viewerSubscribed}
          disable={isPending}
          onClick={onClick}
        />
      )}
    </div>
  );
};

export default VideoOwner;
