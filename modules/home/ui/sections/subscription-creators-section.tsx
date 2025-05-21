"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserAvatar from "@/components/user-avatar";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const SubscriptionCreatorsSection = () => {
  const [subscriptions] =
    trpc.subscriptions.getManySubscriptions.useSuspenseInfiniteQuery(
      {
        limit: 1000000,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <>
          <section className="flex items-center gap-4 overflow-x-scroll overflow-hidden mb-10">
            {subscriptions.pages
              .flatMap((page) => page.items)
              .map((subscription) => (
                <Link
                  href={`/users/${subscription.creatorId}`}
                  key={subscription.creatorId}
                >
                  <Tooltip>
                    <TooltipTrigger>
                      <UserAvatar
                        image={subscription.user.imageUrl}
                        alt={subscription.user.name}
                        className="rounded-full size-24 cursor-pointer"
                      />
                    </TooltipTrigger>
                    <TooltipContent>{subscription.user.name}</TooltipContent>
                  </Tooltip>
                </Link>
              ))}
          </section>
        </>
      </ErrorBoundary>
    </Suspense>
  );
};

export default SubscriptionCreatorsSection;
