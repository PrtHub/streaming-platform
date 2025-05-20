"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import UserAvatar from "@/components/user-avatar";
import { DEFAULT_LIMIT } from "@/constants";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { ChevronRight, ListIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export const SubscriptionsList = () => {
  const pathname = usePathname();
  const { data, isLoading } =
    trpc.subscriptions.getManySubscriptions.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    <SidebarGroup>
      {(data?.pages?.flatMap((page) => page?.items)?.length ?? 0) > 0 && (
        <SidebarGroupLabel className="flex items-center ml-1 font-semibold text-sm mb-2">
          Subscriptions <ChevronRight className="size-3 mt-1" />
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="flex flex-col gap-1">
          {isLoading && (
            <>
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center gap-2 p-2">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 group-data-[collapsible=icon]:hidden">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24 mt-1 group-data-[collapsible=icon]:hidden" />
                  </div>
                </div>
              ))}
            </>
          )}
          {!isLoading &&
            data?.pages
              .flatMap((page) => page.items)
              .map((item) => (
                <SidebarMenuItem key={item.creatorId}>
                  <SidebarMenuButton
                    tooltip={item.user.name}
                    asChild
                    className={cn("h-10 transition-all duration-300")}
                    isActive={pathname === `/users/${item.creatorId}`}
                  >
                    <Link
                      href={`/users/${item.creatorId}`}
                      className="flex items-center gap-4 px-3 group-data-[collapsible=icon]:px-0 w-full"
                    >
                      <div className="flex items-center justify-center w-8">
                        <UserAvatar
                          alt={item.user.name}
                          image={item.user.imageUrl}
                          className="rounded-full size-7"
                        />
                      </div>
                      <span className="text-sm font-medium transition-opacity duration-300 whitespace-nowrap group-data-[collapsible=icon]:hidden">
                        {item.user.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          {!isLoading && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="All Subscriptions"
                isActive={pathname === "/subscriptions"}
                asChild
                className="h-10 transition-all duration-300"
              >
                <Link
                  href="/subscriptions"
                  className="flex items-center gap-4 px-3 group-data-[collapsible=icon]:px-0 w-full"
                >
                  <div className="flex items-center justify-center w-5">
                    <ListIcon className="size-5" />
                  </div>
                  <span className="text-sm font-medium transition-opacity duration-300 whitespace-nowrap group-data-[collapsible=icon]:hidden">
                    All Subscriptions
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
