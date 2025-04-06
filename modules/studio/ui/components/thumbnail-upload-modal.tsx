"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface ThumbnailUploadModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ThumbnailUploadModal = ({
  videoId,
  open,
  onOpenChange,
}: ThumbnailUploadModalProps) => {
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    utils.studio.getOne.invalidate({ id: videoId });
    utils.studio.getMany.invalidate();
    onOpenChange(false);
    toast.success("Thumbnail uploaded!");
  };

  return (
    <ResponsiveModal
      title="Upload Thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint="thumbnailUploader"
        input={{ videoId }}
        onClientUploadComplete={onUploadComplete}
        content={{
          label: (
            <p className="text-white mb-2 mt-2">
              Drag and drop or click to upload
            </p>
          ),
        }}
        className="bg-transparent border-none py-8 ut-ready:border-none ut-uploading:text-white ut-button:bg-zinc-900 ut-button:text-white ut-button:hover:bg-zinc-800 ut-button:transition-colors ut-button:cursor-pointer ut-label:text-white ut-upload-icon:text-white ut-allowed-content:text-white"
      />
    </ResponsiveModal>
  );
};

export default ThumbnailUploadModal;
