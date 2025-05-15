import PlaylistHeaderSection from "../sections/playlist-header-section";
import PlaylistVideosSection from "../sections/playlist-videos-section";

interface PlaylistVideosViewProps {
  playlistId: string;
}

const PlaylistVideosView = ({ playlistId }: PlaylistVideosViewProps) => {
  return (
    <div className="max-w-[1600px] mx-auto mb-10 px-4 flex flex-col  gap-y-6">
      <PlaylistHeaderSection playlistId={playlistId} />
      <PlaylistVideosSection playlistId={playlistId} />
    </div>
  );
};

export default PlaylistVideosView;
