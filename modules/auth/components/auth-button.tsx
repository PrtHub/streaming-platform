"use client";

import { User2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AuthButton = () => {
  return (
    <Button
      variant="ghost"
      className="flex items-center gap-2 rounded-full border border-secondary-foreground/20 px-4 py-1.5 hover:bg-secondary/50 cursor-pointer"
    >
      <User2 className="size-4 font-[400]" />
      <span className="text-sm font-medium">Sign in</span>
    </Button>
  );
};
