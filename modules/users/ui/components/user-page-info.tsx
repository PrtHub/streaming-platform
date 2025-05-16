"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { UserGetOneOutput } from "../../types";
import UserAvatar from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SubscriptionButton from "@/modules/subscriptions/ui/components/subscription-button";
import { useSubscriptions } from "@/modules/subscriptions/hooks/use-subscriptions";
import { cn } from "@/lib/utils";

interface UserBannerProps {
  user: UserGetOneOutput;
}

const UserPageInfo = ({ user }: UserBannerProps) => {
  const { userId, isLoaded } = useAuth();
  const clerk = useClerk();

  const { onClick, isPending } = useSubscriptions({
    userId: user.id,
    isSubscribed: user.viewerSubscribed,
  });

  return (
    <div className="py-6">
      <section className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <UserAvatar
            image={user.imageUrl}
            alt={user.name}
            className="size-12 cursor-pointer"
            onClick={() => {
              if (user.clerkId === userId) {
                clerk.openUserProfile();
              }
            }}
          />
          <article className="flex-1">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>{user.subscriberCount} subscribers</span>
              <span>&bull;</span>
              <span>{user.videosCount} videos</span>
            </div>
          </article>
        </div>
        {user.clerkId === userId ? (
          <Button
            asChild
            variant={"secondary"}
            className="w-full mt-3 rounded-full font-medium"
          >
            <Link href={`/studio`}>Go to studio</Link>
          </Button>
        ) : (
          <SubscriptionButton
            onClick={onClick}
            disable={isPending || !isLoaded}
            isSubscribed={user.viewerSubscribed}
            className="w-full mt-3 rounded-full font-medium"
          />
        )}
      </section>

      <section className="hidden md:flex items-start gap-3">
        <UserAvatar
          image={user.imageUrl}
          alt={user.name}
          className={cn(
            "size-28",
            user.clerkId === userId &&
              "cursor-pointer hover:opacity-70 transition-opacity duration-300"
          )}
          onClick={() => {
            if (user.clerkId === userId) {
              clerk.openUserProfile();
            }
          }}
        />
        <article className="flex-1">
          <h1 className="text-4xl font-bold">{user.name}</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
            <span>{user.subscriberCount} subscribers</span>
            <span>&bull;</span>
            <span>{user.videosCount} videos</span>
          </div>
          {user.clerkId === userId ? (
            <Button
              asChild
              variant={"secondary"}
              className="mt-3 rounded-full px-7 py-4 font-medium"
            >
              <Link href={`/studio`}>Go to studio</Link>
            </Button>
          ) : (
            <SubscriptionButton
              onClick={onClick}
              disable={isPending || !isLoaded}
              isSubscribed={user.viewerSubscribed}
              className="mt-3 rounded-full"
            />
          )}
        </article>
      </section>
    </div>
  );
};

export default UserPageInfo;
