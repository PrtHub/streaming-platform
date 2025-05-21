"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import Link from "next/link";
import SubscriptionItem from "../components/subscription-item";
import { InfiniteScroll } from "@/components/infinite-scroll";

const SubscriptionSection = () => {
  const utils = trpc.useUtils();

  const [subscriptions, query] =
    trpc.subscriptions.getManySubscriptions.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: (data) => {
      toast.success("Unsubscribed!");
      utils.videos.getManySubscriptions.invalidate();
      utils.users.getOne.invalidate({ id: data.creatorId });
      utils.subscriptions.getManySubscriptions.invalidate();
    },
    onError: (err) => {
      toast.error(err?.message);
    },
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <>
          <section className="flex flex-col gap-4">
            {subscriptions.pages
              .flatMap((page) => page.items)
              .map((subscription) => (
                <Link
                  href={`/users/${subscription.creatorId}`}
                  key={subscription.creatorId}
                >
                  <SubscriptionItem
                    name={subscription.user.name}
                    imageUrl={subscription.user.imageUrl}
                    subscriberCount={subscription.user.subscriberCount}
                    onUnsubscribe={() =>
                      unsubscribe.mutate({ userId: subscription.creatorId })
                    }
                    disable={unsubscribe.isPending}
                  />
                </Link>
              ))}
          </section>
          {subscriptions.pages.flatMap((page) => page.items).length === 0 && (
            <p className="text-muted-foreground text-center">
              No subscriptions yet.
            </p>
          )}
          <InfiniteScroll
            hasNextPage={query.hasNextPage}
            fetchNextPage={query.fetchNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
          />
        </>
      </ErrorBoundary>
    </Suspense>
  );
};

export default SubscriptionSection;
