"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";

const StudioSidebarHeader = () => {
  const { user } = useUser();
  const { state } = useSidebar();

  const isCollapsible = state === "collapsed";

  if (!user) {
    return (
      <div className="p-3 group transition-all duration-300 border-b border-border/30">
        <div className="flex flex-col items-center text-center justify-center transition-all duration-300">
          <Skeleton className="size-20 rounded-full mb-2 transition-all duration-300 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:mb-0" />
          <div className="flex flex-col gap-1 transition-all duration-300 max-h-14 overflow-hidden group-data-[collapsible=icon]:max-h-0 group-data-[collapsible=icon]:opacity-0">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 group transition-all duration-300 border-b border-border/30">
      <Link href="/users/current">
        <div
          className={cn(
            "flex flex-col items-center text-center justify-center transition-all duration-300"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="size-20 border transition-all duration-300 group-data-[collapsible=icon]:size-10 mb-2 group-data-[collapsible=icon]:mb-0">
                <AvatarImage
                  src={user.imageUrl}
                  alt={user.fullName || "User"}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className={cn(
                "hidden group-data-[collapsible=icon]:block",
                isCollapsible && "block"
              )}
            >
              <span>{user.fullName || user.username}</span>
            </TooltipContent>
          </Tooltip>
          <div className="flex flex-col whitespace-nowrap transition-all duration-300 max-h-14 overflow-hidden group-data-[collapsible=icon]:max-h-0 group-data-[collapsible=icon]:opacity-0">
            <span className="font-semibold">
              {user.fullName || user.username}
            </span>
            <span className="text-sm text-muted-foreground">
              Creator Studio
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default StudioSidebarHeader;
