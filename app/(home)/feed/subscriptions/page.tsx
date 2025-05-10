import { DEFAULT_LIMIT } from "@/constants";
import SubscriptionsView from "@/modules/home/ui/views/subscription-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const SubscriptionsPage = async () => {
  void trpc.videos.getManySubscriptions.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  );
};

export default SubscriptionsPage;
