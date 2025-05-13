import { HydrateClient } from "@/trpc/server";
import PlaylistsView from "@/modules/playlists/ui/views/playlists-view";

const PlaylistsPage = async () => {
  return (
    <HydrateClient>
      <PlaylistsView />
    </HydrateClient>
  );
};

export default PlaylistsPage;
