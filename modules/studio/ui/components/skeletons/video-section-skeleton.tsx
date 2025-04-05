"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VideoSectionSkeletonProps {
  count?: number;
}

export function VideoSectionSkeleton({ count = 4 }: VideoSectionSkeletonProps) {
  return (
    <div className="rounded border w-full">
      <Table>
        <TableHeader>
          <TableRow className="h-12">
            <TableHead className="pl-6 w-[500px]">Video</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Views</TableHead>
            <TableHead className="text-center">Comments</TableHead>
            <TableHead className="text-center">Likes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: count }).map((_, index) => (
            <TableRow key={index} className="h-12 cursor-pointer">
              <TableCell>
                <div className="flex items-center gap-4">
                  <Skeleton className="shrink-0 w-36 aspect-video rounded" />
                  <div className="flex flex-col gap-1 w-full">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-4 w-6 mx-auto" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-4 w-6 mx-auto" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-4 w-6 mx-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
