"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import { useClerk } from "@clerk/nextjs";
import { Video, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Content",
    href: "/studio",
    icon: <Video className="size-5" />,
    auth: true,
  },
  {
    title: "Exit Studio",
    href: "/",
    icon: <LogOut className="size-5" />,
    auth: true,
  },
];

export const PersonalStudio = () => {
  const pathname = usePathname();
  const clerk = useClerk();
  const { isSignedIn } = useAuth();

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
