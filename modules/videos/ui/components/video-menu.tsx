"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddPlaylistModal from "@/modules/playlists/ui/components/add-playlist-modal";
import {
  ListPlusIcon,
  MoreVertical,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VideoMenuProps {
  videoId: string;
  onRemove?: () => void;
}

const VideoMenu = ({ videoId, onRemove }: VideoMenuProps) => {
  const [openAddPlaylistModal, setOpenAddPlaylistModal] = useState(false);

  const fullUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/videos/${videoId}`;

  const handleShare = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied, now share anywhere!");
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"ghost"}
            size="icon"
            className="rounded-full cursor-pointer"
          >
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
            <ShareIcon className="size-4 mr-2" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenAddPlaylistModal(true)}
            className="cursor-pointer"
          >
            <ListPlusIcon className="size-4 mr-2" />
            Add to Playlist
          </DropdownMenuItem>
          {onRemove && (
            <DropdownMenuItem onClick={() => {}} className="cursor-pointer">
              <Trash2Icon className="size-4 mr-2" />
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AddPlaylistModal
        open={openAddPlaylistModal}
        onOpenChange={setOpenAddPlaylistModal}
        videoId={videoId}
      />
    </>
  );
};

export default VideoMenu;
