"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreatePlaylistModal from "../components/create-playlist-modal";
import PlaylistsSection from "../sections/playlists-section";

const PlaylistsView = () => {
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);

  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 flex flex-col  gap-y-6">
      <CreatePlaylistModal
        open={playlistModalOpen}
        onOpenChange={setPlaylistModalOpen}
      />
      <section className="flex justify-between items-center gap-x-10">
        <article className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-semibold">Playlists</h1>
          <p className="text-muted-foreground text-xs">
            Your collections of videos
          </p>
        </article>
        <Button
          variant={"outline"}
          size={"icon"}
          className="rounded-full flex items-center gap-x-2 cursor-pointer"
          onClick={() => setPlaylistModalOpen(true)}
          aria-label="Create playlist"
          title="Create playlist"
        >
          <Plus className="size-5" />
        </Button>
      </section>
      <PlaylistsSection />
    </div>
  );
};

export default PlaylistsView;
