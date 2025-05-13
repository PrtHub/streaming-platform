import { PlaylistManyOutput } from "../../types";

interface PlaylistInfoProps {
  data: PlaylistManyOutput["items"][number];
}

const PlaylistInfo = ({ data }: PlaylistInfoProps) => {
  return (
    <div className="flex gap-3">
      <div className="flex-1 min-w-0">
        <h1 className="font-medium line-clamp-1 lg:line-clamp-2 break-words text-sn">
          {data.name}
        </h1>
        <p className="text-sm text-muted-foreground">Playlist</p>
        <p className="text-sm text-muted-foreground font-semibold hover:text-primary">
          View full playlist
        </p>
      </div>
    </div>
  );
};

export default PlaylistInfo;
