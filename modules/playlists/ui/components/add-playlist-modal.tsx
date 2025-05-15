"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Loader2, SquareCheckIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";

interface AddPlaylistModalProps {
  open: boolean;
  videoId: string;
  onOpenChange: (open: boolean) => void;
}

const AddPlaylistModal = ({
  open,
  videoId,
  onOpenChange,
}: AddPlaylistModalProps) => {
  const utils = trpc.useUtils();

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    trpc.playlists.getManyForVideo.useInfiniteQuery(
      {
        videoId,
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!videoId && open,
      }
    );

  const addVideo = trpc.playlists.addVideoToPlaylist.useMutation({
    onSuccess: (data) => {
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId });
      utils.playlists.getPlaylistVideos.invalidate({
        playlistId: data.playlistId,
      });
      utils.playlists.getOne.invalidate({ playlistId: data.playlistId });
      toast.success("Video added to playlist");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeVideo = trpc.playlists.removeVideoToPlaylist.useMutation({
    onSuccess: (data) => {
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId });
      utils.playlists.getPlaylistVideos.invalidate({
        playlistId: data.playlistId,
      });
      utils.playlists.getOne.invalidate({ playlistId: data.playlistId });
      toast.success("Video removed from playlist");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <ResponsiveModal
        title="Add to Playlist"
        open={open}
        onOpenChange={onOpenChange}
      >
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            data?.pages
              .flatMap((page) => page.items)
              .map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  size="lg"
                  className="flex items-center justify-start [&_svg]:size-5 px-2 w-full cursor-pointer"
                  onClick={() => {
                    if (playlist.containsVideo) {
                      removeVideo.mutate({
                        playlistId: playlist.id,
                        videoId,
                      });
                    } else {
                      addVideo.mutate({
                        playlistId: playlist.id,
                        videoId,
                      });
                    }
                  }}
                  disabled={addVideo.isPending || removeVideo.isPending}
                >
                  {playlist.containsVideo ? (
                    <SquareCheckIcon className="mr-2 size-4" />
                  ) : (
                    <SquareIcon className="mr-2 size-4" />
                  )}
                  {playlist.name}
                </Button>
              ))
          )}
          {!isLoading && (
            <InfiniteScroll
              isManual
              hasNextPage={hasNextPage}
              fetchNextPage={fetchNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          )}
        </div>
      </ResponsiveModal>
    </>
  );
};

export default AddPlaylistModal;
