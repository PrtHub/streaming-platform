"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { StudioUploader } from "./studio-uploader";
import { useRouter } from "next/navigation";

const StudioUploadModal = () => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const createVideo = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video created");
      utils.studio.getMany.invalidate();
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message);
    },
  });

  const onSuccess = () => {
    if (!createVideo.data?.video.id) return;

    createVideo.reset();
    router.push(`/studio/videos/${createVideo.data?.video.id}`);
  };

  return (
    <>
      <ResponsiveModal
        title="Upload Video"
        open={!!createVideo.data?.url}
        onOpenChange={() => createVideo.reset()}
      >
        {createVideo.data?.url ? (
          <StudioUploader
            endpoint={createVideo.data?.url}
            onSuccess={onSuccess}
          />
        ) : (
          <Loader2 className="size-5 animate-spin" />
        )}
      </ResponsiveModal>
      <Button
        variant="outline"
        className="flex items-center gap-1.5 rounded-full px-4 bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
        onClick={() => createVideo.mutate()}
        disabled={createVideo.isPending}
      >
        {createVideo.isPending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Plus className="size-5" />
        )}
        <span>Create</span>
      </Button>
    </>
  );
};

export default StudioUploadModal;
