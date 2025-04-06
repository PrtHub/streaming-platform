import { z } from "zod";
import { db } from "@/db";
import { usersTable, videosTable } from "@/db/schema";

import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ videoId: z.string().uuid() }))
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.clerkId, clerkUserId))
        .limit(1);

      if (!user) throw new UploadThingError("Unauthorized");

      return { user, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(videosTable)
        .set({ thumbnailUrl: file.url })
        .where(
          and(
            eq(videosTable.id, metadata.videoId),
            eq(videosTable.userId, metadata.user.id)
          )
        );

      return {
        uploadedBy: metadata.user.id,
        videoId: metadata.videoId,
        url: file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
