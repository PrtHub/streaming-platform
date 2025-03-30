"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const StudioUploadModal = () => {
  return (
    <Button
      variant="outline"
      className="flex items-center gap-1.5 rounded-full px-4 bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
    >
      <Plus className="size-5" />
      <span>Create</span>
    </Button>
  );
};

export default StudioUploadModal;
