"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface PlaylistHeaderSectionProps {
  playlistId: string;
}

const PlaylistHeaderSection = ({ playlistId }: PlaylistHeaderSectionProps) => {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({
    playlistId,
  });

  const removePlaylist = trpc.playlists.removePlaylist.useMutation({
    onSuccess: () => {
      toast.success("Playlist removed!");
      utils.playlists.getMany.invalidate();
      router.push("/playlists");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to remove playlist");
    },
  });

  return (
    <Suspense fallback={<>Loading....</>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <header className="flex justify-between items-center gap-x-10">
          <article className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-semibold">{playlist.name}</h1>
            <p className="text-muted-foreground text-xs">
              Your playlist collection
            </p>
          </article>
          <Button
            variant={"outline"}
            size={"icon"}
            className="rounded-full flex items-center gap-x-2 cursor-pointer"
            onClick={() => removePlaylist.mutate({ playlistId })}
            aria-label="Create playlist"
            title="Create playlist"
            disabled={removePlaylist.isPending}
          >
            <Trash2Icon className="size-5" />
          </Button>
        </header>
      </ErrorBoundary>
    </Suspense>
  );
};

export default PlaylistHeaderSection;
