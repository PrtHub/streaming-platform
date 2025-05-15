import { DEFAULT_LIMIT } from "@/constants";
import PlaylistVideosView from "@/modules/playlists/ui/views/playlist-videos-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PlaylistIdPageProps {
  params: Promise<{ playlistId: string }>;
}

const PlaylistIdPage = async ({ params }: PlaylistIdPageProps) => {
  const { playlistId } = await params;

  void trpc.playlists.getPlaylistVideos.prefetchInfinite({
    playlistId,
    limit: DEFAULT_LIMIT,
  });

  void trpc.playlists.getOne.prefetch({
    playlistId,
  });

  return (
    <HydrateClient>
      <PlaylistVideosView playlistId={playlistId} />
    </HydrateClient>
  );
};

export default PlaylistIdPage;
