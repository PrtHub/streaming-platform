"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface BannerUploadModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BannerUploadModal = ({
  userId,
  open,
  onOpenChange,
}: BannerUploadModalProps) => {
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    utils.users.getOne.invalidate({ id: userId });
    onOpenChange(false);
    toast.success("Banner uploaded!");
  };

  return (
    <ResponsiveModal
      title="Upload Banner"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint="bannerUploader"
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

export default BannerUploadModal;
