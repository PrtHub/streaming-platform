import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";
import SubscriptionsView from "@/modules/subscriptions/ui/views/subscriptions-view";

export const dynamic = "force-dynamic";

const SubscriptionsPage = async () => {
  void trpc.subscriptions.getManySubscriptions.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  );
};

export default SubscriptionsPage;
