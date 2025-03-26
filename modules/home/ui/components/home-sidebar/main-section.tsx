"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Home, Library, PlaySquareIcon, Flame } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Home",
    href: "/",
    icon: <Home className="size-5" />,
    auth: false,
  },
  {
    title: "Trending",
    href: "/feed/trending",
    icon: <Flame className="size-5" />,
    auth: false,
  },
  {
    title: "Subscriptions",
    href: "/feed/subscriptions",
    auth: true,
    icon: <PlaySquareIcon className="size-5" />,
  },
  {
    title: "Library",
    href: "/library",
    icon: <Library className="size-5" />,
    auth: false,
  },
];

export const MainSection = () => {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();

  return (
    <SidebarGroup>
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
