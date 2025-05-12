"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import { useClerk } from "@clerk/nextjs";
import { History, ThumbsUp, ListVideo, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "History",
    href: "/history",
    icon: <History className="size-5" />,
    auth: true,
  },
  {
    title: "Liked videos",
    href: "/liked",
    icon: <ThumbsUp className="size-5" />,
    auth: true,
  },
  {
    title: "Playlists",
    href: "/playlists",
    icon: <ListVideo className="size-5" />,
    auth: true,
  },
];

export const PersonalSection = () => {
  const pathname = usePathname();
  const clerk = useClerk();
  const { isSignedIn } = useAuth();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center ml-1 font-semibold text-sm mb-2">
        You <ChevronRight className="size-3 mt-1" />
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="flex flex-col gap-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={pathname === item.href}
                asChild
                onClick={(e) => {
                  if (item.auth && !isSignedIn) {
                    e.preventDefault();
                    return clerk.openSignIn();
                  }
                }}
                className={cn("h-10 transition-all duration-300")}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-4 px-3 group-data-[collapsible=icon]:px-0 w-full"
                >
                  <div className="flex items-center justify-center w-5">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium transition-opacity duration-300 whitespace-nowrap group-data-[collapsible=icon]:hidden">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
