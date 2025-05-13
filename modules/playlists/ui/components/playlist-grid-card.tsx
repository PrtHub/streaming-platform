"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PlaylistManyOutput } from "../../types";
import Link from "next/link";
import PlaylistThumbnail from "./playlist-thumbnail";
import { THUMBNAIL_URL } from "@/constants";
import PlaylistInfo from "./playlist-info";

interface PlaylistGridCardProps {
  playlist: PlaylistManyOutput["items"][number];
}

export const PlaylistGridCardSkeleton = () => {
  return (
    <div>
      <Skeleton />
    </div>
  );
};

const PlaylistGridCard = ({ playlist }: PlaylistGridCardProps) => {
  return (
    <Link href={`/playlists/${playlist.id}`}>
      <div className="w-full flex flex-col gap-2 group">
        <PlaylistThumbnail
          title={playlist.name}
          videosCount={playlist.videosCount}
          imageUrl={THUMBNAIL_URL}
        />
        <PlaylistInfo data={playlist} />
      </div>
    </Link>
  );
};

export default PlaylistGridCard;
