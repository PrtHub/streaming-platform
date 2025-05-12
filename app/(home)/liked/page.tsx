import { HydrateClient, trpc } from "@/trpc/server";

import { DEFAULT_LIMIT } from "@/constants";
import LikedView from "@/modules/playlists/ui/views/liked-view";

const LikedPage = () => {
  void trpc.playlists.getManyLiked.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <LikedView />
    </HydrateClient>
  );
};

export default LikedPage;
